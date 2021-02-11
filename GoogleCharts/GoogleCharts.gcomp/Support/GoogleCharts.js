(function () {
    'use strict';

    const load = async function (version, packagesJSON, mapsApiKey) {
        const packages = JSON.parse(packagesJSON);
        const options = {
            packages
        };
        if (mapsApiKey !== '') {
            options.mapsApiKey = mapsApiKey;
        }
        await window.google.charts.load(version, options);
    };

    const createGeoChart = function (container) {
        const geoChartReference = new window.google.visualization.GeoChart(container);
        return geoChartReference;
    };

    const plotGeoChartData = function (geoChartReference, columnsJSON, rowsJSON) {
        const columns = JSON.parse(columnsJSON);
        const rows = JSON.parse(rowsJSON);
        const array = [columns, ...rows];
        const data = window.google.visualization.arrayToDataTable(array);
        const options = {displayMode: 'text'};
        geoChartReference.draw(data, options);
    };

    window.WebVIGoogleCharts = {
        load,
        createGeoChart,
        plotGeoChartData
    };
}());
