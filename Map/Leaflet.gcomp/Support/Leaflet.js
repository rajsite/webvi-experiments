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

    const addMarkersToMap = function (map, markers) {
        markers.forEach(marker => map.addLayer(marker));
    };

    const createMarker = function (latitude, longitude, text, iconUrl) {
        const options = {};
        if (iconUrl !== '') {
            options.icon = L.icon({iconUrl});
        }
        const marker = L.marker([latitude, longitude], options);
        if (text !== '') {
            marker.bindPopup(text);
        }
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

    const addMarkerEventListener = function (markers) {
        const createEventListener = function (marker, index, controller) {
            marker.on('click', () => controller.enqueue(index));
        };

        const eventStream = new ReadableStream({
            start (controller) {
                markers.forEach((marker, index) => createEventListener(marker, index, controller));
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const waitForMarkerEvent = async function (eventStreamReader) {
        const {value} = await eventStreamReader.read();
        const index = typeof value === 'number' ? value : -1;
        return index;
    };

    window.WebVILeaflet = {
        addTileLayer,
        createMap,
        destroyMap,
        addMarkersToMap,
        createMarker,
        destroyMarker,
        showMarker,
        updateMarkerText,
        addMarkerEventListener,
        waitForMarkerEvent
    };
}());
