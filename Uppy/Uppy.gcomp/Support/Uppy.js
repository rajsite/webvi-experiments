/* globals Uppy: false */
(function () {
    'use strict';

    // const base64EncodeByteArray = function (uint8Array) {
    //     let stringBuffer = '';
    //     for (let i = 0; i < uint8Array.length; i++) {
    //         stringBuffer += String.fromCharCode(uint8Array[i]);
    //     }
    //     return window.btoa(stringBuffer);
    // };

    // window.WebVIUppy = {};
    // // Asks the user for a file, loads the contents in memory, and returns it as a Uint8Array
    // // Relies on NXG 3.1 Promise support for async JavaScript
    // window.WebVIUppy.getUserFile = async function () {
    //     const file = await userFileSelection();
    //     const uint8Array = await fileRead(file);
    //     return uint8Array;
    // };

    // window.WebVIUppy.base64EncodeByteArray = base64EncodeByteArray;

    class RefnumManager {
        constructor () {
            this._nextRefnum = 1;
            this.refnums = new Map();
        }

        createRefnum (obj) {
            const refnum = this._nextRefnum;
            this._nextRefnum += 1;
            this.refnums.set(refnum, obj);
            return refnum;
        }

        getObject (refnum) {
            return this.refnums.get(refnum);
        }

        closeRefnum (refnum) {
            this.refnums.delete(refnum);
        }
    }
    const refnumManager = new RefnumManager();

    const createUppy = function () {
        const uppyConfig = {
            core: JSON.stringify({}),
            dashboard: JSON.stringify({
                locale: {
                    strings: {
                        uploadXFiles: {
                            0: 'Open %{smart_count} file',
                            1: 'Open %{smart_count} files'
                        }
                    }
                }
            }),
            webcam: JSON.stringify({})
        };

        const refnum = refnumManager.createRefnum(uppyConfig);
        return refnum;
    };

    const destroyUppy = function (refnum) {
        const options = refnumManager.getObject(refnum);
        if (options !== undefined) {
            refnumManager.closeRefnum(refnum);
        }
    };

    const setUppyOptions = function (refnum, name, optionsJSON) {
        const uppyConfig = refnumManager.getObject(refnum);
        if (uppyConfig === undefined) {
            throw new Error('Invalid Uppy refnum.');
        }

        uppyConfig[name] = optionsJSON;
    };

    const requestUppyFiles = function (refnum) {
        return new Promise(function (resolve, reject) {
            const uppyConfig = refnumManager.getObject(refnum);
            if (uppyConfig === undefined) {
                throw new Error('Invalid Uppy refnum.');
            }

            let cleanup;
            const core = JSON.parse(uppyConfig.core);
            if (core.restrictions !== undefined) {
                const keysToCoerce = ['maxFileSize', 'maxNumberOfFiles', 'minNumberOfFiles'];
                keysToCoerce.forEach(function (key) {
                    if (core.restrictions[key] === -1) {
                        core.restrictions[key] = null;
                    }
                });

                if (core.restrictions.allowedFileTypes.length === 0) {
                    core.restrictions.allowedFileTypes = null;
                }
            }
            core.onBeforeUpload = function (uppyFiles) {
                // Get the user selected file / blob
                const uppyFileRefnums = new Int32Array(Object.keys(uppyFiles).map((key) => refnumManager.createRefnum(uppyFiles[key].data)));
                resolve(uppyFileRefnums);

                // Clean-up the dialog and uppy state
                cleanup();
                return false;
            };

            // Only one upload makes sense since the node blocks until upload finishes
            core.allowMultipleUploads = false;

            const uppy = Uppy.Core(core);
            cleanup = function () {
                uppy.getPlugin('Dashboard').closeModal();
                uppy.close();
            };

            const dashboardPlugins = [];
            const webcam = JSON.parse(uppyConfig.webcam);
            if (Object.keys(webcam).length > 0) {
                dashboardPlugins.push('Webcam');
                uppy.use(Uppy.Webcam, webcam);
            }

            const dashboard = JSON.parse(uppyConfig.dashboard);
            dashboard.plugins = dashboardPlugins;
            dashboard.trigger = null;
            dashboard.onRequestCloseModal = () => {
                reject(new Error('No file selected'));
                cleanup();
            };
            uppy.use(Uppy.Dashboard, dashboard);

            // Open the dashboard and wait for selection or cancel
            uppy.getPlugin('Dashboard').openModal();
        });
    };

    const destroyUppyFiles = function (uppyFileRefnums) {
        uppyFileRefnums.forEach(function (uppyFileRefnum) {
            const uppyFile = refnumManager.getObject(uppyFileRefnum);
            if (uppyFile !== undefined) {
                refnumManager.closeRefnum(uppyFileRefnum);
            }
        });
    };

    const readUppyFile = function (uppyFileRefnum) {
        return new Promise(function (resolve, reject) {
            const uppyFile = refnumManager.getObject(uppyFileRefnum);
            if (uppyFile === undefined) {
                throw new Error('Invalid Uppy File refnum.');
            }

            const fileReader = new FileReader();
            const loadendHandler = function () {
                fileReader.removeEventListener('loadend', loadendHandler);
                if (fileReader.error) {
                    reject(fileReader.error);
                } else {
                    const result = new Uint8Array(fileReader.result);
                    resolve(result);
                }
            };

            fileReader.addEventListener('loadend', loadendHandler);
            fileReader.readAsArrayBuffer(uppyFile);
        });
    };

    window.WebVIUppy = {
        createUppy,
        setUppyOptions,
        destroyUppy,
        requestUppyFiles,
        destroyUppyFiles,
        readUppyFile
    };
}());
