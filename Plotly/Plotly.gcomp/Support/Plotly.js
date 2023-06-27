(function () {
    'use strict';

    const resizeObserverSymbol = Symbol('plotly resize observer');
    const create = function (container) {
        const plotlyDiv = document.createElement('div');
        plotlyDiv.style.height = '100%';
        plotlyDiv.style.width = '100%';
        container.innerHTML = '';
        container.appendChild(plotlyDiv);

        // Use ResizeObserver for responsive styling
        // https://github.com/plotly/plotly.js/issues/3984#issuecomment-506098853
        const resizeObserver = new ResizeObserver(() => {
            window.Plotly.Plots.resize(plotlyDiv);
        });
        resizeObserver.observe(plotlyDiv);
        plotlyDiv[resizeObserverSymbol] = resizeObserver;
        return plotlyDiv;
    };

    const destroy = function (plotlyDiv) {
        if (!plotlyDiv || !plotlyDiv[resizeObserverSymbol]) {
            return;
        }
        plotlyDiv[resizeObserverSymbol].disconnect();
        window.Plotly.purge(plotlyDiv);
        plotlyDiv.parentNode.removeChild(plotlyDiv);
    };

    window.WebVIPlotly = {
        create,
        destroy
    };
}());
