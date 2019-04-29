/* global L:false */
(function () {
    'use strict';

    const createLeafletMap = function (selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}. Instead found ${elements.length} elements`);
        }

        const element = elements[0];
        const map = L.map(element);
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        });

        map.addLayer(tileLayer);
    };

    window.WebVILeaflet = {
        createLeafletMap
    };
}());
