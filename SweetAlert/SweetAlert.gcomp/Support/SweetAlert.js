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

    const postProcessOptions = function (options) {
        if (options.input === 'select') {
            options.inputOptions = options.inputOptionsArray.reduce((inputOptions, option) => {
                inputOptions[option.value] = option.displayValue;
                return inputOptions;
            }, {});
            if ((options.inputOptions[options.inputValue] === undefined)) {
                throw new Error(`select default value: ${options.inputValue} does not exist in options array`);
            }
        }
    };

    const validDismiss = function (dismiss) {
        return ['success', 'backdrop', 'cancel', 'close', 'esc', 'timer'].includes(dismiss);
    };

    const coerceDismiss = function (dismiss) {
        if (dismiss === undefined) {
            return 'success';
        }
        if (validDismiss(dismiss)) {
            return dismiss;
        }
        return 'unknown';
    };

    const coerceValue = function (value) {
        return value === undefined ? '' : String(value);
    };

    const postProcessResults = function (options, results) {
        if (options.input === 'select') {
            if (options.inputOptions[results.value] === undefined) {
                results.value = '';
                if (results.dismiss === 'success') {
                    results.dismiss = 'unknown';
                }
            }
        }
    };

    let pendingPromise;
    const fire = async function (optionsArrayJSON) {
        const optionsArray = JSON.parse(optionsArrayJSON).map(option => JSON.parse(option.propertiesJSON));
        const options = {};
        deepMerge(options, ...optionsArray);

        // looks like if a parallel call is made to Swal.fire the current call is never resolved so prevent parallel calls
        // TODO this only stops parallel calls through the JSLI calls, should file an issue on SweetAlert GitHub in general
        if (pendingPromise !== undefined) {
            throw new Error('SweetAlert dialog already open, cannot open new dialog');
        }
        postProcessOptions(options);
        pendingPromise = window.Swal.fire(options);
        let resultsInitial;
        try {
            resultsInitial = await pendingPromise;
        } finally {
            pendingPromise = undefined;
        }
        const results = {
            dismiss: coerceDismiss(resultsInitial.dismiss),
            value: coerceValue(resultsInitial.value)
        };
        postProcessResults(options, results);
        const resultsJSON = JSON.stringify(results);
        return resultsJSON;
    };

    window.WebVISweetAlert = {fire};
}());
