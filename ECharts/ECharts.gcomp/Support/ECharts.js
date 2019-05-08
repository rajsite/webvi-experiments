/* global echarts:false */
(function () {
    'use strict';

    let nextRefnum = 1;
    class RefnumManager {
        constructor () {
            this.refnums = new Map();
        }

        createRefnum (obj) {
            const refnum = nextRefnum;
            nextRefnum += 1;
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
        const echartRefnum = refnumManager.createRefnum(echart);
        return echartRefnum;
    };

    const destroyEChart = function (echartRefnum) {
        const echart = refnumManager.getObject(echartRefnum);
        if (echart !== undefined) {
            refnumManager.closeRefnum(echartRefnum);
            echarts.dispose(echart);
        }
    };

    const updateEChart = function (echartRefnum, optionsArrayJSON) {
        const echart = refnumManager.getObject(echartRefnum);
        if (echart === undefined) {
            throw new Error('Invalid echarts refnum');
        }

        // The optionsArrayJSON is a string that represents a JSON array of JSON objects of structure: [{"name": string, "propertiesJSON": string}, ...]
        // The propertiesJSON is a string that represents a JSON object of arbitrary structure
        const optionsArray = JSON.parse(optionsArrayJSON);
        const options = {};
        optionsArray.forEach(function (option) {
            options[option.name] = JSON.parse(option.propertiesJSON);
        });
        echart.setOption(options);
    };

    window.WebVIECharts = {
        createEChart,
        destroyEChart,
        updateEChart
    };
}());
