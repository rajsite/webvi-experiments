/* globals Uppy: false */
(function () {
    'use strict';

    const createObjectUrlWithMetadata = function (blobOrFile) {
        const fileObjectUrlInitial = URL.createObjectURL(blobOrFile);
        const url = new URL(fileObjectUrlInitial);

        // We rely on using the hash to store file metadata
        if (url.hash !== '') {
            URL.revokeObjectURL(blobOrFile);
            throw new Error('File API Unsupported: cannot store file metadata on blob url');
        }

        const metadata = new URLSearchParams();
        metadata.set('name', typeof blobOrFile.name === 'string' ? blobOrFile.name : '');
        url.hash = metadata.toString();
        const fileObjectUrl = url.toString();
        return fileObjectUrl;
    };

    const deepMerge = function (target, ...args) {
        const isObject = function (obj) {
            return typeof obj === 'object' && obj !== null;
        };
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

    const requestFiles = function (optionsArrayJSON) {
        return new Promise(function (resolve, reject) {
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

            const optionsArray = JSON.parse(optionsArrayJSON);
            optionsArray
                .map(option => JSON.parse(option.propertiesJSON))
                .forEach(function (properties) {
                    deepMerge(uppyConfig, properties);
                });

            let cleanup;
            uppyConfig.core.onBeforeUpload = function (uppyFiles) {
                // Get the user selected file / blob
                // TODO try and get name metadata for Blob types, ie webcam?
                const fileObjectUrls = Object.keys(uppyFiles)
                    .map(key => uppyFiles[key].data)
                    .map(blobOrFile => createObjectUrlWithMetadata(blobOrFile));
                const fileObjectUrlsJSON = JSON.stringify(fileObjectUrls);
                resolve(fileObjectUrlsJSON);

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

    window.WebVIUppy = {requestFiles};
}());
