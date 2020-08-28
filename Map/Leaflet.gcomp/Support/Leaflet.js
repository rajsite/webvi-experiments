/* global L:false */
(function () {
    'use strict';

    const createMap = function (placeholder, latitude, longitude, zoomLevel) {
        return new Promise(function (resolve) {
            const map = L.map(placeholder).setView([latitude, longitude], zoomLevel);
            map.whenReady(function () {
                resolve(map);
            });
        });
    };

    const addTileLayer = function (map, urlTemplate, attribution) {
        const tileLayer = L.tileLayer(urlTemplate, {
            attribution
        });

        map.addLayer(tileLayer);
    };

    const destroyMap = function (map) {
        map.remove();
    };

    const createMarker = function (map, latitude, longitude, text, iconUrl) {
        const options = {};
        if (iconUrl !== '') {
            options.icon = L.icon({iconUrl});
        }
        const marker = L.marker([latitude, longitude], options);
        if (text !== '') {
            marker.bindPopup(text);
        }
        map.addLayer(marker);
        return marker;
    };

    const showMarker = function (marker) {
        marker.openPopup();
    };

    const destroyMarker = function (marker) {
        marker.remove();
    };

    const updateMarkerText = function (marker, text) {
        if (text !== '') {
            if (marker.getPopup()) {
                marker.setPopupContent(text);
            } else {
                marker.bindPopup(text);
            }
        }
    };

    window.WebVILeaflet = {
        addTileLayer,
        createMap,
        destroyMap,
        createMarker,
        destroyMarker,
        showMarker,
        updateMarkerText
    };
}());
