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

    const isObject = function (obj) {
        return typeof obj === 'object' && obj !== null;
    };

    const deepMerge = function (target, ...args) {
        args.forEach(function (arg) {
            if (Array.isArray(arg)) {
                if (!Array.isArray(target)) {
                    throw new Error('Cannot merge an array onto a target non-array');
                }
                arg.forEach(item => target.push(item));
            } else if (isObject(arg)) {
                Object.keys(arg).forEach(function (prop) {
                    if (Array.isArray(arg[prop])) {
                        if (!Array.isArray(target[prop])) {
                            target[prop] = [];
                        }
                        deepMerge(target[prop], arg[prop]);
                    } else if (isObject(arg[prop])) {
                        if (!isObject(target[prop])) {
                            target[prop] = {};
                        }
                        deepMerge(target[prop], arg[prop]);
                    } else {
                        target[prop] = arg[prop];
                    }
                });
            } else {
                throw new Error('Cannot merge arg into target, arg must be an array or object to merge');
            }
        });
    };

    const createUppy = function () {
        const uppyConfig = {
            core: {
                // Only one upload makes sense since the node blocks until upload finishes
                allowMultipleUploads: false
            },
            dashboard: {
                // don't want any element to trigger the dashboard
                trigger: null
            }
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

    const setUppyOptions = function (reference, optionsJSON) {
        const uppyConfig = referenceManager.getObject(reference);
        if (uppyConfig === undefined) {
            throw new Error('Invalid Uppy reference.');
        }

        const options = JSON.parse(optionsJSON);
        deepMerge(uppyConfig, options);
    };

    const requestUppyFiles = function (reference) {
        return new Promise(function (resolve, reject) {
            const uppyConfig = referenceManager.getObject(reference);
            if (uppyConfig === undefined) {
                throw new Error('Invalid Uppy reference.');
            }

            let cleanup;
            uppyConfig.core.onBeforeUpload = function (uppyFiles) {
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

            const uppy = Uppy.Core(uppyConfig.core);
            cleanup = function () {
                uppy.getPlugin('Dashboard').closeModal();
                uppy.close();
            };

            const dashboardPlugins = [];
            if (uppyConfig.webcam !== undefined) {
                dashboardPlugins.push('Webcam');
                uppy.use(Uppy.Webcam, uppyConfig.webcam);
            }

            uppyConfig.dashboard.plugins = dashboardPlugins;
            uppyConfig.dashboard.onRequestCloseModal = () => {
                reject(new Error('No file selected'));
                cleanup();
            };
            uppy.use(Uppy.Dashboard, uppyConfig.dashboard);

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
        const blob = new Blob([uint8Array], {type: contentType});
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

    const downloadUppyFile = function (uppyFileReference, fileName) {
        const uppyFile = referenceManager.getObject(uppyFileReference);
        if (uppyFile === undefined) {
            throw new Error('Invalid Uppy File reference.');
        }

        // support for the download attribute is coming in iOS 13: https://bugs.webkit.org/show_bug.cgi?id=167341
        if ('download' in HTMLAnchorElement.prototype === false) {
            throw new Error('Browser does not support anchor download attribute, unable to trigger download');
        }

        const downloadElement = document.createElement('a');
        downloadElement.download = fileName;
        downloadElement.href = uppyFile;
        downloadElement.rel = 'noopener';

        // Had to append the element to the DOM first for Firefox (not needed for Chrome, Edge, and Safari untested)
        // See https://stackoverflow.com/a/27116581
        // looks like appending to the dom prevents the issue with revoking too quickly from below in firefox (issue continues in Edge, safari untested)
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);

        // If the uppyFile is revoked too quickly this fails in Firefox and Edge (Safari untested)
        // See https://github.com/eligrey/FileSaver.js/issues/205#issuecomment-503370302
        // URL.revokeObjectURL(uppyFile); // test fast revoke, TODO remove
        // putting it in a setTimeout(fn,0) doesn't help Firefox or Edge either
        // TODO consider making a copy that gets revoked later. might not be useful since bad behavior is only in Edge (not a problem in Edgium, safari untested)
    };

    const encodeAsBase64 = function (byteArray) {
        const binaryString = String.fromCharCode.apply(undefined, byteArray);
        const base64EncodedString = btoa(binaryString);
        return base64EncodedString;
    };

    const decodeFromBase64 = function (base64EncodedString) {
        const binaryString = atob(base64EncodedString);
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < byteArray.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray;
    };

    window.WebVIUppy = {
        createUppy,
        setUppyOptions,
        destroyUppy,
        requestUppyFiles,
        destroyUppyFiles,
        readUppyFile,
        createUppyFile,
        getUppyFileUrl,
        downloadUppyFile,
        encodeAsBase64,
        decodeFromBase64
    };
}());
