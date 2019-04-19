// Wrapper code for ECharts to call from the JavaScript Library Interface
// For more information on preparing JavaScript code see: http://www.ni.com/documentation/en/labview-web-module/3.0/manual/prepare-your-js-code/

// Surround code in an immediately-invoked function expression (IIFE) to allow for private variables that should not be shared in the global scope
(function () {
    // Enable strict mode to improve error handling
    'use strict';

    const prefix = 'ECharts-webvi';
    const createdClass = `${prefix}-created`;

    let currentUniqueDOMID = 0;
    function createUniqueDOMID () {
        const uniqueDOMID = `${prefix}-instance-${currentUniqueDOMID}`;
        currentUniqueDOMID++;
        return uniqueDOMID;
    }

    let nextRefnum = 1;
    class RefnumManager {
        constructor () {
            this.refnums = new Map();
        }

        createRefnum (obj) {
            let refnum = nextRefnum;
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

    function findPlaceholderElement (placeholderText) {
        if (placeholderText.indexOf(prefix) !== 0) {
            throw new Error(`A valid placeholder text control must start with the text ${prefix}. For example: ${prefix}-myexample1. Instead given ${placeholderText}.`);
        }

        const placeholderElements = document.querySelectorAll(`ni-text[text="${placeholderText}"`);
        if (placeholderElements.length !== 1) {
            throw new Error(`Found ${placeholderElements.length} placeholder text control with contents ${placeholderText}. Duplicate controls with the same placeholder text are not allowed.`);
        }
        return placeholderElements[0];
    }

    function destroyEChart (echartRefnum) {
        const echart = refnumManager.getObject(echartRefnum);
        if (rgraph === undefined) {
            return;
        }
        refnumManager.closeRefnum(echartRefnum);
    }

    function updateEChartData (echartRefnum, valuePropertiesJSON) {
        const echart = refnumManager.getObject(echartRefnum);
        if (echart === undefined) {
            throw new Error(`No exisiting EChart exists with refnum: ${echartRefnum}`);
        }
        const valueProperties = JSON.parse(valuePropertiesJSON || '{}');

        echart.setOption({
            series: {
                data: valueProperties
            }
        })
    }

    function updateEChartOptions (echartRefnum, optionsJSON) {
        const echart = refnumManager.getObject(echartRefnum);
        if (echart === undefined) {
            throw new Error(`No exisiting EChart exists with refnum: ${echartRefnum}`);
        }
        const option = JSON.parse(optionsJSON || '{}');
        console.log(option);

        echart.setOption(option);
    }
    
    function createCanvasOrRetrieveCanvasID (placeholderElement) {
        if (!(placeholderElement.firstElementChild instanceof HTMLCanvasElement)) {
            // Canvas elements are unique in that you must set width and height to exact values to scale correctly
            // For other elements you can instead set width and height to 100% in a stylesheet instead
            const placeholderWidth = placeholderElement.offsetWidth;
            const placeholderHeight = placeholderElement.offsetHeight;
            const devicePixelRatio = window.devicePixelRatio;
            placeholderElement.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.id = createUniqueDOMID();
            canvas.width = placeholderWidth * devicePixelRatio;
            canvas.height = placeholderHeight * devicePixelRatio;
            canvas.style.width = `${placeholderWidth}px`;
            canvas.style.height = `${placeholderHeight}px`;
            placeholderElement.appendChild(canvas);

            // Add a class to the placeholder element when it is created to target from CSS
            placeholderElement.classList.add(createdClass);
        }
        return placeholderElement.firstElementChild.id;
    }

    function createEChart (placeholderText) {
        const placeholderElement = findPlaceholderElement(placeholderText);

        const canvasID = createCanvasOrRetrieveCanvasID(placeholderElement);

        // Create the EChart
        const echart = echarts.init(document.getElementById(canvasID));

        // Save and return the refnum
        return refnumManager.createRefnum(echart);
    }

    // Create one namespace to prevent collisions in global scope
    window.EChartJSLI = {
        createEChart,
        updateEChartData,
        updateEChartOptions
    };
}());
