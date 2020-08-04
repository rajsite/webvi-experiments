(function () {
    'use strict';

    let currentUniqueDOMID = 0;
    const createUniqueDOMID = function () {
        const uniqueDOMID = `webvi-rgraph-instance-${currentUniqueDOMID}`;
        currentUniqueDOMID += 1;
        return uniqueDOMID;
    };

    const findGlobalFunction = function (globalFunctionName) {
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
    };

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

    const transformValueProperties = function (valuePropertiesUntransformed) {
        return Object.assign({}, ...Object.keys(valuePropertiesUntransformed).map(prop => {
            if (transforms[prop]) {
                return transforms[prop](valuePropertiesUntransformed[prop]);
            }
            return {
                [prop]: valuePropertiesUntransformed[prop]
            };
        }));
    };

    const destroy = function (rgraph) {
        window.RGraph.reset(rgraph.canvas);
    };

    const update = function (rgraph, valuePropertiesJSON, optionsJSON, effect) {
        const valuePropertiesUntransformed = JSON.parse(valuePropertiesJSON || '{}');
        const valueProperties = transformValueProperties(valuePropertiesUntransformed);
        const options = JSON.parse(optionsJSON || '{}');

        window.RGraph.clear(rgraph.canvas);

        // Set non-options config such as data, value, min, max, etc
        Object.assign(rgraph, valueProperties);

        // Set options config
        rgraph.set(options);

        // Perform effect if desired. The "draw" effect required to see rgraph. Skip effect if creating combined chart.
        if (effect) {
            rgraph[effect]();
        }
    };

    const createCanvasOrRetrieveCanvasID = function (container) {
        if (!(container.firstElementChild instanceof HTMLCanvasElement)) {
            // Canvas elements are unique in that you must set width and height to exact values to scale correctly
            // For other elements you can instead set width and height to 100% in a stylesheet instead
            const placeholderWidth = container.offsetWidth;
            const placeholderHeight = container.offsetHeight;
            const devicePixelRatio = window.devicePixelRatio;
            container.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.id = createUniqueDOMID();
            canvas.width = placeholderWidth * devicePixelRatio;
            canvas.height = placeholderHeight * devicePixelRatio;
            canvas.style.width = `${placeholderWidth}px`;
            canvas.style.height = `${placeholderHeight}px`;
            container.appendChild(canvas);
        }
        return container.firstElementChild.id;
    };

    const create = function (container, rgraphConstructorName, valuePropertiesJSON, optionsJSON, effect) {
        const RGraphConstructor = findGlobalFunction(rgraphConstructorName);
        const valuePropertiesUntransformed = JSON.parse(valuePropertiesJSON || '{}');
        const valueProperties = transformValueProperties(valuePropertiesUntransformed);
        const options = JSON.parse(optionsJSON || '{}');

        const canvasID = createCanvasOrRetrieveCanvasID(container);

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
        return rgraph;
    };

    // Create one namespace to prevent collisions in global scope
    window.WebVIRGraph = {
        create,
        update,
        destroy
    };
}());
