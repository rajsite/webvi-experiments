(function () {
    'use strict';

    const authFailure = new Promise((_resolve, reject) => {
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
        constructor (lat, lng, title, iconUrl) {
            const options = {
                position: {lat, lng},
                title
            };
            if (iconUrl !== '') {
                options.icon = iconUrl;
            }
            const marker = new window.google.maps.Marker(options);
            marker.addListener('click', () => this.showMarkerInfo());

            this._webVIMap = undefined;
            this._title = title;
            this._marker = marker;
        }

        get marker () {
            return this._marker;
        }

        addMarkerToMap (webVIMap) {
            this._webVIMap = webVIMap;
            this._marker.setMap(webVIMap.map);
        }

        setTitle (title) {
            if (this._webVIMap === undefined) {
                throw new Error('Marker must be attached to map.');
            }
            this._title = title;
            this._marker.setTitle(title);
            this._webVIMap.updateMarkerInfoIfOpen(this._title, this._marker);
        }

        showMarkerInfo () {
            if (this._webVIMap === undefined) {
                throw new Error('Marker must be attached to map.');
            }
            this._webVIMap.showMarkerInfo(this._title, this._marker);
        }

        destroy () {
            this._webVIMap = undefined;
            window.google.maps.event.clearInstanceListeners(this._marker);
            this._marker.setMap(null);
        }

        addClickEventListener (callback) {
            this._marker.addListener('click', () => callback());
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

    const destroyMap = function (webVIMap) {
        // No auth check, always cleanup
        webVIMap.destroy();
    };

    const addMarkersToMap = async function (webVIMap, webVIMarkers) {
        await tryAuthCheck();
        webVIMarkers.forEach(webVIMarker => webVIMarker.addMarkerToMap(webVIMap));
    };

    const addShapesToMap = async function (webVIMap, shapes) {
        await tryAuthCheck();
        shapes.forEach(shape => shape.setMap(webVIMap.map));
    };

    const createMarker = async function (lat, lng, title, iconUrl) {
        await tryAuthCheck();
        const webVIMarker = new WebVIMarker(lat, lng, title, iconUrl);
        return webVIMarker;
    };

    const showMarker = async function (webVIMarker) {
        await tryAuthCheck();
        webVIMarker.showMarkerInfo();
    };

    const destroyMarker = function (webVIMarker) {
        // No auth check, always cleanup
        webVIMarker.destroy();
    };

    const updateMarkerText = async function (webVIMarker, title) {
        await tryAuthCheck();
        webVIMarker.setTitle(title);
    };

    const createMarkerGroup = async function (webVIMap, webVIMarkers) {
        await tryAuthCheck();
        const markers = webVIMarkers.map(webviMarker => {
            webviMarker.addMarkerToMap(webVIMap);
            return webviMarker.marker;
        });

        const markerGroup = new window.MarkerClusterer(webVIMap.map, markers, {
            styles: [
                {
                    width: 30,
                    height: 30,
                    className: 'webvi-marker-group-1',
                },
                {
                    width: 40,
                    height: 40,
                    className: 'webvi-marker-group-2',
                },
                {
                    width: 50,
                    height: 50,
                    className: 'webvi-marker-group-3',
                }
            ],
            clusterClass: 'webvi-marker-group'
        });
        return markerGroup;
    };

    const destroyMarkerGroup = function (webVIMarkerGroup) {
        // No auth check, always cleanup
        webVIMarkerGroup.clearMarkers();
        webVIMarkerGroup.setMap(null);
    };

    const createPolylineShape = async function (coordinatesJSON, strokeJSON) {
        await tryAuthCheck();
        const coordinates = JSON.parse(coordinatesJSON);
        const path = coordinates.map(coordinate => ({
            lat: coordinate.latitude,
            lng: coordinate.longitude
        }));
        const {color, opacity, weight} = JSON.parse(strokeJSON);
        const polyline = new window.google.maps.Polyline({
            path,
            strokeColor: color,
            strokeOpacity: opacity,
            strokeWeight: weight
        });
        return polyline;
    };

    const destroyShape = function (shape) {
        // No auth check, always cleanup
        shape.setMap(null);
    };

    const addMarkerEventListener = async function (webVIMarkers) {
        await tryAuthCheck();
        const createEventListener = function (webVIMarker, index, controller) {
            webVIMarker.addClickEventListener(() => controller.enqueue(index));
        };

        const eventStream = new ReadableStream({
            start (controller) {
                webVIMarkers.forEach((webviMarker, index) => createEventListener(webviMarker, index, controller));
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const waitForMarkerEvent = async function (eventStreamReader) {
        await tryAuthCheck();
        const {value} = await eventStreamReader.read();
        const index = typeof value === 'number' ? value : -1;
        return index;
    };

    window.WebVIGoogleMap = {
        initialize,
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
        addMarkerEventListener,
        waitForMarkerEvent
    };
}());
