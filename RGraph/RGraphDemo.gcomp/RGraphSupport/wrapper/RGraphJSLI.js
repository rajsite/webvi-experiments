// Wrapper code for RGraph to call from the JavaScript Library Interface
// For more information on preparing JavaScript code see: http://www.ni.com/documentation/en/labview-web-module/3.0/manual/prepare-your-js-code/

// Surround code in an immediately-invoked function expression (IIFE) to allow for private variables that should not be shared in the global scope
(function () {
    // Enable strict mode to improve error handling
    'use strict';

    const prefix = 'rgraph-webvi';
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

    function findGlobalFunction (globalFunctionName) {
        const names = globalFunctionName.split('.');

        let context = window;
        let globalFunction = context[names[0]];
        for (let i = 1; i < names.length; i++) {
            if (globalFunction === undefined) {
                break;
            }

            context = globalFunction;
            globalFunction = context[names[i]];
        }
        if (typeof globalFunction !== 'function') {
            throw new Error(`Cannot find a global function with name: "${globalFunctionName}"`);
        }

        // Return a new function that has globalFunction bound to its context so it can be invoked correctly (ie console.log must be bound to console object)
        return globalFunction.bind(context);
    }

    const clusterToPoint = function (cluster) {
        const point = [cluster.x, cluster.y];
        if (cluster.color) {
            point.push(cluster.color);
        }
        return point;
    };

    const transforms = {
        // Transforms 2d array of cluster of {x,y} to 2d array of RGraph points
        data_webvi_scatter: function (initialData) {
            return {
                data: initialData.map(row => row.map(cluster => clusterToPoint(cluster)))
            };
        }
    };

    function transformValueProperties (valuePropertiesUntransformed) {
        return Object.assign({}, ...Object.keys(valuePropertiesUntransformed).map(prop => {
            if (transforms[prop]) {
                return transforms[prop](valuePropertiesUntransformed[prop]);
            }
            return {
                [prop]: valuePropertiesUntransformed[prop]
            };
        }));
    }

    function destroyRGraph (rgraphRefnum) {
        const rgraph = refnumManager.getObject(rgraphRefnum);
        if (rgraph === undefined) {
            return;
        }
        refnumManager.closeRefnum(rgraphRefnum);
        RGraph.reset(rgraph.canvas);
    }

    function updateRGraph (rgraphRefnum, valuePropertiesJSON, optionsJSON, effect) {
        const rgraph = refnumManager.getObject(rgraphRefnum);
        if (rgraph === undefined) {
            throw new Error(`No exisiting RGraph exists with refnum: ${rgraphRefnum}`);
        }
        const valuePropertiesUntransformed = JSON.parse(valuePropertiesJSON || '{}');
        const valueProperties = transformValueProperties(valuePropertiesUntransformed);
        const options = JSON.parse(optionsJSON || '{}');

        RGraph.clear(rgraph.canvas);

        // Set non-options config such as data, value, min, max, etc
        Object.assign(rgraph, valueProperties);

        // Set options config
        rgraph.set(options);

        // Perform effect if desired. The "draw" effect required to see rgraph. Skip effect if creating combined chart.
        if (effect) {
            rgraph[effect]();
        }
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

    function createRGraph (placeholderText, rgraphConstructorName, valuePropertiesJSON, optionsJSON, effect) {
        const placeholderElement = findPlaceholderElement(placeholderText);
        const RGraphConstructor = findGlobalFunction(rgraphConstructorName);
        const valuePropertiesUntransformed = JSON.parse(valuePropertiesJSON || '{}');
        const valueProperties = transformValueProperties(valuePropertiesUntransformed);
        const options = JSON.parse(optionsJSON || '{}');

        const canvasID = createCanvasOrRetrieveCanvasID(placeholderElement);

        // Update the config to point to the new canvas object
        valueProperties.id = canvasID;
        valueProperties.options = options;

        // Create the rgraph
        const rgraph = new RGraphConstructor(valueProperties);

        // Perform effect if desired. The "draw" effect required to see rgraph. Skip effect if creating combined chart.
        if (effect) {
            rgraph[effect]();
        }

        // Save and return the refnum
        return refnumManager.createRefnum(rgraph);
    }

    // Create one namespace to prevent collisions in global scope
    window.RGraphJSLI = {
        createRGraph,
        updateRGraph,
        destroyRGraph
    };
}());
