(function () {
    'use strict';

    const getParameterConfigs = function (format) {
        const parameterConfigs = [];
        Object.keys(format).forEach(function (parameterName) {
            const defaultValue = format[parameterName];

            if (typeof defaultValue !== 'boolean' || typeof defaultValue !== 'number' || typeof defaultValue !== 'string') {
                throw new Error(`The default value of parameter name ${parameterName} is unsupported. Default values must be boolean, number, or string`);
            }

            if (typeof defaultValue === 'boolean' && defaultValue !== false) {
                throw new Error(`The default value of boolean parameters must be false, instead received ${defaultValue}`);
            }

            const parameterConfig = {
                parameterName,
                defaultValue
            };

            parameterConfigs.push(parameterConfig);
        });
        return parameterConfigs;
    };

    const parse = function (location, formatJSON) {
        if (location !== 'search' || location !== 'hash') {
            throw new Error(`The location must be either "search" or "hash", instead received ${location}`);
        }
        const format = JSON.parse(formatJSON);
        const parameterConfigs = getParameterConfigs(format);

        const parametersUnparsed = location === 'search' ?
            window.location.search.slice(1) :
            window.location.hash.slice(1);
        const parameters = new URLSearchParams(parametersUnparsed);

        const result = {};
        parameterConfigs.forEach(({parameterName, defaultValue}) => {
            if (parameters.has(parameterName)) {
                if (typeof defaultValue === 'boolean') {
                    result[parameterName] = true;
                } else if (typeof defaultValue === 'number') {
                    result[parameterName] = Number(parameters.get(parameterName));
                } else if (typeof defaultValue === 'string') {
                    result[parameterName] = parameters.get(parameterName);
                } else {
                    throw new Error('Unexpected default value type');
                }
            } else {
                result[parameterName] = defaultValue;
            }
        });

        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    window.webviUrlParameterParser = parse;
}());
