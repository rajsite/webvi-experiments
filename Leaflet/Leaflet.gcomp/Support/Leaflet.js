/* eslint-disable no-magic-numbers */
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
            const tileLayer = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
                // Other OpenStreetMap tile servers: https://wiki.openstreetmap.org/wiki/Tile_servers
                // WikiMedia Maps Terms of Use: https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use
                // Must be attributed for OpenStreetMaps, see: https://www.openstreetmap.org/copyright
                attribution: '<a href="https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use">Wikimedia Maps</a> | Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
            });

            map.addLayer(tileLayer);
            const mapReference = referenceManager.createReference(map);
            map.whenReady(function () {
                resolve(mapReference);
            });
        });
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
        markerCreate,
        markerDestroy,
        markerPopupShow
    };
}());
