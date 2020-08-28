(function () {
    'use strict';

    let infoWindow;
    const initialize = function (key) {
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
                infoWindow = new window.google.maps.InfoWindow();
                resolve();
            };
            script.addEventListener('error', function () {
                window.WebVIGoogleMapLoaded = undefined;
                reject();
            });
            document.head.append(script);
        });
    };

    const createMap = function (placeholder, lat, lng, zoom) {
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

    const destroyMap = function (map) {
        const mapElement = map.getDiv();
        mapElement.parentNode.removeChild(mapElement);
    };

    const markerTitles = new WeakMap();
    const showMarkerIfPossible = function (marker) {
        if (markerTitles.has(marker)) {
            const title = markerTitles.get(marker);
            infoWindow.setContent(title);
            const map = marker.getMap();
            infoWindow.open(map, marker);
        }
    };

    const createMarker = function (map, lat, lng, title, iconUrl) {
        const options = {
            position: {lat, lng},
            map,
            title
        };
        if (iconUrl !== '') {
            options.icon = iconUrl;
        }
        const marker = new window.google.maps.Marker(options);
        if (title !== '') {
            markerTitles.set(marker, title);
        }
        marker.addListener('click', function () {
            showMarkerIfPossible(marker);
        });
        return marker;
    };

    const showMarker = function (marker) {
        showMarkerIfPossible(marker);
    };

    const destroyMarker = function (marker) {
        markerTitles.delete(marker);
        window.google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
    };

    const updateMarkerText = function (marker, title) {
        if (title !== '') {
            markerTitles.set(marker, title);
            marker.setTitle(title);
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
