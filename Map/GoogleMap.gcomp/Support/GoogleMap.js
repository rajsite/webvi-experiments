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

    const initialize = function (key) {
        return new Promise(function (resolve, reject) {
            const scriptClass = 'webvi-google-map-script';
            const scriptSelector = `.${scriptClass}`;
            const elements = document.querySelectorAll(scriptSelector);
            if (elements.length !== 0) {
                throw new Error('Google Maps has already been initialized');
            }
            const script = document.createElement('script');
            script.classList.add(scriptClass);
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

    const validateGoogleMapsLoaded = function () {
        if ((window.google && window.google.maps) === false) {
            throw new Error('Google Maps not loaded. Must call initialize before using Google Maps.');
        }
    };

    const createMap = function (selector, lat, lng, zoom) {
        validateGoogleMapsLoaded();
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected one element with selector ${selector} but found ${elements.length}`);
        }
        const [container] = elements;
        const map = new window.google.maps.Map(container, {
            center: {lat, lng},
            zoom
        });
        const mapReference = referenceManager.createReference(map);
        return mapReference;
    };

    window.WebVIGoogleMap = {initialize, createMap};
}());
