/* global echarts:false */
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

    const createEChart = function (selector) {
        const parents = document.querySelectorAll(selector);
        if (parents.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, instead found ${parents.length}`);
        }
        const parent = parents[0];
        parent.innerHTML = '';

        const element = document.createElement('div');
        element.style.width = '100%';
        element.style.height = '100%';

        parent.appendChild(element);
        const echart = echarts.init(element);
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                echart.resize();
            });
            resizeObserver.observe(element);
        }
        const echartReference = referenceManager.createReference(echart);
        return echartReference;
    };

    const destroyEChart = function (echartReference) {
        const echart = referenceManager.getObject(echartReference);
        if (echart !== undefined) {
            referenceManager.closeReference(echartReference);
            echarts.dispose(echart);
        }
    };

    const updateEChart = function (echartReference, optionsArrayJSON) {
        const echart = referenceManager.getObject(echartReference);
        if (echart === undefined) {
            throw new Error('Invalid echarts reference.');
        }

        // The optionsArrayJSON is a string that represents a JSON array of JSON objects of structure: [{"name": string, "propertiesJSON": string}, ...]
        // The propertiesJSON is a string that represents a JSON object of arbitrary structure
        const optionsArray = JSON.parse(optionsArrayJSON);
        const options = {};
        optionsArray.forEach(function (option) {
            const properties = JSON.parse(option.propertiesJSON);
            if (option.name === 'series') {
                if (options.series === undefined) {
                    options.series = [];
                }
                options.series.push(properties);
            } else {
                options[option.name] = properties;
            }
        });
        echart.setOption(options);
    };

    window.WebVIECharts = {
        createEChart,
        destroyEChart,
        updateEChart
    };
}());
