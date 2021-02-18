(function () {
    'use strict';

    const authFailure = new Promise((resolve, reject) => {
        const originalGMAuthFailure = window.gm_authFailure;
        window.gm_authFailure = function (...args) {
            reject(new Error('Google Maps Authentication Failure, see browser console for more details'));
            if (typeof originalGMAuthFailure === 'function') {
                originalGMAuthFailure.call(window, ...args);
            }
        };
    });

    const tryAuthCheck = async function () {
        await Promise.race([authFailure, Promise.resolve()]);
    };

    const mapInfoWindows = new WeakMap();
    const getOrCreateInfoWindow = function (map) {
        if (mapInfoWindows.has(map)) {
            const infoWindow = mapInfoWindows.get(map);
            return infoWindow;
        }
        const infoWindow = new window.google.maps.InfoWindow();
        mapInfoWindows.set(map, infoWindow);
        return infoWindow;
    };

    const markerTitles = new WeakMap();
    const markerMaps = new WeakMap();
    const showMarkerIfPossible = function (marker) {
        if (markerTitles.has(marker)) {
            const title = markerTitles.get(marker);
            const map = markerMaps.get(marker);
            const infoWindow = getOrCreateInfoWindow(map);
            infoWindow.setContent(title);
            infoWindow.open(map, marker);
        }
    };

    const loadGoogleMapScript = function (key) {
        return new Promise(function (resolve, reject) {
            if ((window.google && window.google.maps) || window.WebVIGoogleMapLoaded) {
                throw new Error('Google Maps has already been initialized or is initializing');
            }
            const script = document.createElement('script');
            const scriptSrc = new URL('https://maps.googleapis.com/maps/api/js');
            scriptSrc.search = new URLSearchParams({key, callback: 'WebVIGoogleMapLoaded'});
            script.src = scriptSrc;

            window.WebVIGoogleMapLoaded = function () {
                window.WebVIGoogleMapLoaded = undefined;
                resolve();
            };
            script.addEventListener('error', function () {
                window.WebVIGoogleMapLoaded = undefined;
                reject();
            });
            document.head.append(script);
        });
    };

    // public functions
    const initialize = async function (key) {
        await Promise.race([
            authFailure,
            loadGoogleMapScript(key)
        ]);
    };

    const createMap = async function (placeholder, lat, lng, zoom) {
        await tryAuthCheck();
        if ((window.google && window.google.maps) === false) {
            throw new Error('Google Maps not loaded. Must call initialize before using Google Maps.');
        }

        const mapElement = document.createElement('div');
        mapElement.style.width = '100%';
        mapElement.style.height = '100%';
        placeholder.appendChild(mapElement);

        const map = new window.google.maps.Map(mapElement, {
            center: {lat, lng},
            zoom
        });
        return map;
    };

    const destroyMap = async function (map) {
        mapInfoWindows.delete(map);
        const mapElement = map.getDiv();
        mapElement.parentNode.removeChild(mapElement);
    };

    const createMarker = async function (map, lat, lng, title, iconUrl) {
        await tryAuthCheck();
        const options = {
            position: {lat, lng},
            map,
            title
        };
        if (iconUrl !== '') {
            options.icon = iconUrl;
        }
        const marker = new window.google.maps.Marker(options);
        markerMaps.set(marker, map);
        if (title !== '') {
            markerTitles.set(marker, title);
        }
        marker.addListener('click', function () {
            showMarkerIfPossible(marker);
        });
        return marker;
    };

    const showMarker = async function (marker) {
        await tryAuthCheck();
        showMarkerIfPossible(marker);
    };

    const destroyMarker = async function (marker) {
        markerMaps.delete(marker);
        markerTitles.delete(marker);
        window.google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
    };

    const updateMarkerText = async function (marker, title) {
        await tryAuthCheck();
        if (title !== '') {
            markerTitles.set(marker, title);
            marker.setTitle(title);
            const map = markerMaps.get(marker);
            const infoWindow = getOrCreateInfoWindow(map);
            if (infoWindow.getAnchor() === marker) {
                infoWindow.setContent(title);
            }
        }
    };

    window.WebVIGoogleMap = {
        initialize,
        createMap,
        destroyMap,
        createMarker,
        destroyMarker,
        showMarker,
        updateMarkerText
    };
}());
