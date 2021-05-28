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

    // https://github.com/plotly/plotly.js/issues/3984#issuecomment-506098853

    class WebVIPlotly {
        constructor (container) {
            const graphDiv = document.createElement('div');
            graphDiv.style.height = '100%';
            graphDiv.style.width = '100%';
            container.appendChild(graphDiv);

            // traces docs: https://plotly.com/javascript/reference/
            const traces = [];

            // layout docs: https://plotly.com/javascript/reference/layout/
            const layout = {
                autoSize: true
            };

            // config docs: https://plotly.com/javascript/configuration-options/
            const config = {
                responsive: true
            };

            // Function docs https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot
            window.Plotly.newPlot(graphDiv, traces, layout, config);

            // Create ResizeObserver https://github.com/plotly/plotly.js/issues/3984#issuecomment-506098853
            const resizeObserver = new ResizeObserver(() => {
                window.Plotly.Plots.resize(graphDiv);
            });
            resizeObserver.observe(graphDiv);
            this.graphDiv = graphDiv;
            this.resizeObserver = resizeObserver;
        }

        destroy () {
            this.resizeObserver.disconnect();
            window.Plotly.purge(this.graphDiv);
            this.graphDiv.parentNode.removeChild(this.graphDiv);
            this.resizeObserver = undefined;
            this.graphDiv = undefined;
        }
    }

    const create = function (container) {
        const webviPlotly = new WebVIPlotly(container);
        return webviPlotly;
    };

    const setTraces = function () {
        deepMerge();
    };

    // Updates both the config and layout
    // config has to be se twith Plotly.plot https://community.plotly.com/t/update-config-function/9057/2
    const updateConfig = function () {
    };

    const destroy = function (webviPlotly) {
        webviPlotly.destroy();
    };

    window.WebVIPlotly = {
        create,
        setTraces,
        updateConfig,
        destroy
    };
}());
