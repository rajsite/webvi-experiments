/* global L:false */
(function () {
    'use strict';

    class ReferenceManager {
        constructor () {
            this._nextReference = 1;
            this.references = new Map();
        }

        createReference (obj) {
            const reference = this._nextReference;
            this._nextReference += 1;
            this.references.set(reference, obj);
            return reference;
        }

        getObject (reference) {
            return this.references.get(reference);
        }

        closeReference (reference) {
            this.references.delete(reference);
        }
    }
    const referenceManager = new ReferenceManager();

    const mapCreate = function (selector, latitude, longitude, zoomLevel) {
        return new Promise(function (resolve) {
            const parents = document.querySelectorAll(selector);
            if (parents.length !== 1) {
                throw new Error(`Expected to find one element with selector ${selector}. Instead found ${parents.length} elements`);
            }

            const parent = parents[0];
            parent.innerHTML = '';

            const element = document.createElement('div');
            element.style = 'width: 100%; height: 100%';
            parent.appendChild(element);

            const map = L.map(element).setView([latitude, longitude], zoomLevel);
            const mapReference = referenceManager.createReference(map);
            map.whenReady(function () {
                resolve(mapReference);
            });
        });
    };

    const addTileLayer = function (mapReference, urlTemplate, attribution) {
        const map = referenceManager.getObject(mapReference);
        if (map === undefined) {
            throw new Error('Invalid Leaflet map reference');
        }
        const tileLayer = L.tileLayer(urlTemplate, {
            attribution
        });

        map.addLayer(tileLayer);
    };

    const mapDestroy = function (mapReference) {
        const map = referenceManager.getObject(mapReference);
        if (map === undefined) {
            throw new Error('Invalid Leaflet map reference');
        }
        referenceManager.closeReference(mapReference);
        map.remove();
    };

    const markerCreate = function (mapReference, latitude, longitude, text) {
        const map = referenceManager.getObject(mapReference);
        if (map === undefined) {
            throw new Error('Invalid Leaflet map reference');
        }
        const marker = L.marker([latitude, longitude]);
        if (text.length !== 0) {
            marker.bindPopup(text);
        }
        map.addLayer(marker);
        const markerReference = referenceManager.createReference(marker);
        return markerReference;
    };

    const markerPopupShow = function (markerReference) {
        const marker = referenceManager.getObject(markerReference);
        if (marker === undefined) {
            throw new Error('Invalid Leaflet marker reference');
        }
        marker.openPopup();
    };

    const markerDestroy = function (markerReference) {
        const marker = referenceManager.getObject(markerReference);
        if (marker === undefined) {
            throw new Error('Invalid Leaflet marker reference');
        }
        referenceManager.closeReference(markerReference);
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
