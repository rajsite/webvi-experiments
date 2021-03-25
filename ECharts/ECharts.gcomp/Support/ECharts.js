/* global echarts:false */
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

    const lookupPath = function (target, pathSegments) {
        const isObject = function (obj) {
            return typeof obj === 'object' && obj !== null;
        };
        const result = pathSegments.reduce(function (obj, pathSegment) {
            if (Array.isArray(obj)) {
                if (pathSegment === ':end') {
                    return obj[obj.length - 1];
                }
                return obj[pathSegment];
            }
            if (isObject(obj)) {
                return obj[pathSegment];
            }
            throw new Error(`Cannot find value at path: ${pathSegments.join('.')}`);
        }, target);
        return result;
    };

    const createEChart = function (container) {
        const element = document.createElement('div');
        element.style.width = '100%';
        element.style.height = '100%';
        container.appendChild(element);
        const echart = echarts.init(element);
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                echart.resize();
            });
            resizeObserver.observe(element);
        }

        return echart;
    };

    const destroyEChart = function (echart) {
        if (echart !== undefined) {
            echarts.dispose(echart);
        }
    };

    const updateEChart = function (echart, optionsArrayJSON) {
        // The optionsArrayJSON is a string that represents a JSON array of JSON objects of structure: [{"path": [string], "propertiesJSON": string}, ...]
        // The propertiesJSON is a string that represents a JSON object of arbitrary structure
        const optionsArray = JSON.parse(optionsArrayJSON);
        const options = {};
        optionsArray.forEach(function (option) {
            const target = lookupPath(options, option.path);
            const properties = JSON.parse(option.propertiesJSON);
            deepMerge(target, properties);
        });
        echart.setOption(options);
    };

    window.WebVIECharts = {
        createEChart,
        destroyEChart,
        updateEChart
    };
}());
