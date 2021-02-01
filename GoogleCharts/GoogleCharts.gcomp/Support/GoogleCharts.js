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

    const plotGeoChartData = function (geoChartReference) {
        const data = window.google.visualization.arrayToDataTable([
            ['Country', 'Popularity'],
            ['South America',
                // eslint-disable-next-line no-magic-numbers
                600
            ],
            ['Canada',
                // eslint-disable-next-line no-magic-numbers
                500
            ],
            ['France',
                // eslint-disable-next-line no-magic-numbers
                600
            ],
            ['Russia',
                // eslint-disable-next-line no-magic-numbers
                700
            ],
            ['Australia',
                // eslint-disable-next-line no-magic-numbers
                600
            ]
        ]);

        const options = {displayMode: 'text'};
        geoChartReference.draw(data, options);
    };

    window.WebVIGoogleCharts = {
        load,
        createGeoChart,
        plotGeoChartData
    };
}());
