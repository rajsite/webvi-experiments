/* globals Uppy: false */
(function () {
    'use strict';

    class ReferenceManager {
        constructor () {
            this._nextReference = 1;
            this.references = new Map();
        }

        createReference (obj) {
            const reference = this._nextReference;
            this._nextReference += 1;
            this.references.set(reference, obj);
            return reference;
        }

        getObject (reference) {
            return this.references.get(reference);
        }

        closeReference (reference) {
            this.references.delete(reference);
        }
    }
    const referenceManager = new ReferenceManager();

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

        const reference = referenceManager.createReference(uppyConfig);
        return reference;
    };

    const destroyUppy = function (reference) {
        const options = referenceManager.getObject(reference);
        if (options !== undefined) {
            referenceManager.closeReference(reference);
        }
    };

    const setUppyOptions = function (reference, name, optionsJSON) {
        const uppyConfig = referenceManager.getObject(reference);
        if (uppyConfig === undefined) {
            throw new Error('Invalid Uppy reference.');
        }

        uppyConfig[name] = optionsJSON;
    };

    const requestUppyFiles = function (reference) {
        return new Promise(function (resolve, reject) {
            const uppyConfig = referenceManager.getObject(reference);
            if (uppyConfig === undefined) {
                throw new Error('Invalid Uppy reference.');
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
                const uppyFileReferences = new Int32Array(Object.keys(uppyFiles)
                    .map(key => uppyFiles[key].data)
                    .map(blobOrFile => URL.createObjectURL(blobOrFile))
                    .map(uppyFile => referenceManager.createReference(uppyFile))
                );
                resolve(uppyFileReferences);

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

    const destroyUppyFiles = function (uppyFileReferences) {
        uppyFileReferences.forEach(function (uppyFileReference) {
            const uppyFile = referenceManager.getObject(uppyFileReference);
            if (uppyFile !== undefined) {
                URL.revokeObjectURL(uppyFile);
                referenceManager.closeReference(uppyFileReference);
            }
        });
    };

    const readUppyFile = async function (uppyFileReference) {
        const uppyFile = referenceManager.getObject(uppyFileReference);
        if (uppyFile === undefined) {
            throw new Error('Invalid Uppy File reference.');
        }
        const response = await fetch(uppyFile);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    };

    const createUppyFile = function (uint8Array, contentType) {
        const blob = new Blob(uint8Array, {type: contentType});
        const uppyFile = URL.createObjectURL(blob);
        const uppyFileReference = referenceManager.createReference(uppyFile);
        return uppyFileReference;
    };

    const getUppyFileUrl = function (uppyFileReference) {
        const uppyFile = referenceManager.getObject(uppyFileReference);
        if (uppyFile === undefined) {
            throw new Error('Invalid Uppy File reference.');
        }
        return uppyFile;
    };

    // support for the download attribute is coming in iOS 13: https://bugs.webkit.org/show_bug.cgi?id=167341

    window.WebVIUppy = {
        createUppy,
        setUppyOptions,
        destroyUppy,
        requestUppyFiles,
        destroyUppyFiles,
        readUppyFile,
        createUppyFile,
        getUppyFileUrl
    };
}());
