/* globals Uppy: false */
(function () {
    'use strict';

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

    const coerceToFile = function (uppyFile) {
        const fileOrBlob = uppyFile.data;
        // Preserve File for metadata (lastModified, contentType, etc.)
        if (fileOrBlob instanceof File) {
            return fileOrBlob;
        }
        const meta = {};
        if (typeof uppyFile.type === 'string' && uppyFile.type.length !== 0) {
            meta.type = uppyFile.type;
        }
        const file = new File([fileOrBlob], uppyFile.name, meta);
        return file;
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
                const fileObjectUrls = Object.keys(uppyFiles)
                    .map(fileId => uppyFiles[fileId])
                    .map(uppyFile => coerceToFile(uppyFile));
                resolve(fileObjectUrls);

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
