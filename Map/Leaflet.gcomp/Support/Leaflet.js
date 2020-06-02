/* global L:false */
(function () {
    'use strict';

    const mapCreate = function (placeholder, latitude, longitude, zoomLevel) {
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

    const mapDestroy = function (map) {
        map.remove();
    };

    const markerCreate = function (map, latitude, longitude, text, iconUrl) {
        const options = {};
        if (iconUrl !== '') {
            options.icon = L.icon({iconUrl});
        }
        const marker = L.marker([latitude, longitude], options);
        if (text.length !== 0) {
            marker.bindPopup(text);
        }
        map.addLayer(marker);
        return marker;
    };

    const markerPopupShow = function (marker) {
        marker.openPopup();
    };

    const markerDestroy = function (marker) {
        marker.remove();
    };

    window.WebVILeaflet = {
        mapCreate,
        mapDestroy,
        addTileLayer,
        markerCreate,
        markerDestroy,
        markerPopupShow
    };
}());
