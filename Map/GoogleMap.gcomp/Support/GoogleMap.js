(function () {
    'use strict';

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

        const map = new window.google.maps.Map(placeholder, {
            center: {lat, lng},
            zoom
        });
        return map;
    };

    const createMarker = function (map, lat, lng, title) {
        const marker = new window.google.maps.Marker({
            position: {lat, lng},
            map,
            title
        });
        return marker;
    };

    const destroyMarker = function (marker) {
        marker.setMap(null);
    };

    window.WebVIGoogleMap = {initialize, createMap, createMarker, destroyMarker};
}());
