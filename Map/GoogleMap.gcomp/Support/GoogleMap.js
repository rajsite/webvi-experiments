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
        if ((window.google && window.google.maps) === false) {
            throw new Error('Google Maps not loaded. Must call initialize before using Google Maps.');
        }
        await Promise.race([authFailure, Promise.resolve()]);
    };

    class WebVIMap {
        constructor (mapElement, lat, lng, zoom) {
            const options = {
                center: {lat, lng},
                zoom
            };
            this._map = new window.google.maps.Map(mapElement, options);
            this._infoWindow = new window.google.maps.InfoWindow();
        }

        get map () {
            return this._map;
        }

        destroy () {
            const mapElement = this._map.getDiv();
            mapElement.parentNode.removeChild(mapElement);
        }

        showMarkerInfo (title, marker) {
            if (title === '') {
                return;
            }
            this._infoWindow.setContent(title);
            this._infoWindow.open(this._map, marker);
        }

        updateMarkerInfoIfOpen (title, marker) {
            if (title === '') {
                return;
            }
            if (this._infoWindow.getAnchor() === marker) {
                this._infoWindow.setContent(title);
            }
        }
    }

    class WebVIMarker {
        constructor (webVIMap, lat, lng, title, iconUrl) {
            const options = {
                position: {lat, lng},
                map: webVIMap.map,
                title
            };
            if (iconUrl !== '') {
                options.icon = iconUrl;
            }
            const marker = new window.google.maps.Marker(options);
            marker.addListener('click', () => this.showMarkerInfo());

            this._webVIMap = webVIMap;
            this._title = title;
            this._marker = marker;
        }

        setTitle (title) {
            this._title = title;
            this._marker.setTitle(title);
            this._webVIMap.updateMarkerInfoIfOpen(this._title, this._marker);
        }

        showMarkerInfo () {
            this._webVIMap.showMarkerInfo(this._title, this._marker);
        }

        destroy () {
            window.google.maps.event.clearInstanceListeners(this._marker);
            this._marker.setMap(null);
        }
    }

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
        const mapElement = document.createElement('div');
        mapElement.style.width = '100%';
        mapElement.style.height = '100%';
        placeholder.appendChild(mapElement);

        const webVIMap = new WebVIMap(mapElement, lat, lng, zoom);
        return webVIMap;
    };

    const destroyMap = async function (webVIMap) {
        // No auth check, always cleanup
        webVIMap.destroy();
    };

    const createMarker = async function (webVIMap, lat, lng, title, iconUrl) {
        await tryAuthCheck();
        const webVIMarker = new WebVIMarker(webVIMap, lat, lng, title, iconUrl);
        return webVIMarker;
    };

    const showMarker = async function (webVIMarker) {
        await tryAuthCheck();
        webVIMarker.showMarkerInfo();
    };

    const destroyMarker = async function (webVIMarker) {
        // No auth check, always cleanup
        webVIMarker.destroy();
    };

    const updateMarkerText = async function (webVIMarker, title) {
        await tryAuthCheck();
        webVIMarker.setTitle(title);
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
