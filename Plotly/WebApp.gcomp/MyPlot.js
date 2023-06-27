(function () {
    'use strict';

    window.myPlot = function (plotlyDiv, x, y) {
        const trace = {
            x,
            y,
            mode: 'lines+markers',
            type: 'scatter'
        };
        const data = [trace];
        const layout = {
            autosize: true
        };
        window.Plotly.newPlot(plotlyDiv, data, layout);
    };
}());
