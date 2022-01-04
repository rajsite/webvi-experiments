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

    const addShapesToMap = function (map, shapes) {
        shapes.forEach(shape => shape.addTo(map));
    };

    const createMarker = function (configJSON) {
        const config = JSON.parse(configJSON);
        const options = {};
        if (config.iconUrl !== '') {
            options.icon = L.icon({
                iconUrl: config.iconUrl,
                iconAnchor: L.point(config.iconAnchor.x, config.iconAnchor.y),
                popupAnchor: L.point(config.popupAnchor.x, config.popupAnchor.y)
            });
        }
        const marker = L.marker([config.coordinate.latitude, config.coordinate.longitude], options);
        if (config.popupText !== '') {
            marker.bindPopup(config.popupText);
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

    const createMarkerGroup = function (map, markers) {
        const markerGroup = L.markerClusterGroup();
        markers.forEach(marker => marker.remove());
        markerGroup.addLayers(markers);
        map.addLayer(markerGroup);
        return markerGroup;
    };

    const zoomToMarkerInMarkerGroup = async function (markerGroup, marker) {
        return new Promise(resolve => {
            markerGroup.zoomToShowLayer(marker, () => resolve());
        });
    };

    const destroyMarkerGroup = function (markerGroup) {
        markerGroup.clearLayers();
        markerGroup.remove();
    };

    const createPolylineShape = function (coordinatesJSON, strokeJSON) {
        const coordinates = JSON.parse(coordinatesJSON);
        const path = coordinates.map(coordinate => ([
            coordinate.latitude,
            coordinate.longitude
        ]));
        const {color, opacity, weight} = JSON.parse(strokeJSON);
        const polyline = window.L.polyline(path, {
            color,
            opacity,
            weight
        });
        return polyline;
    };

    const destroyShape = function (shape) {
        shape.remove();
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
        addShapesToMap,
        createMarker,
        destroyMarker,
        showMarker,
        updateMarkerText,
        createMarkerGroup,
        destroyMarkerGroup,
        createPolylineShape,
        destroyShape,
        zoomToMarkerInMarkerGroup,
        addMarkerEventListener,
        waitForMarkerEvent
    };
}());
