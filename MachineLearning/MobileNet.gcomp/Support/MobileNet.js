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

    const imageLoad = function (img, src) {
        return new Promise(function (resolve) {
            const loadHandler = function () {
                img.removeEventListener('load', loadHandler);
                resolve();
            };
            img.addEventListener('load', loadHandler);
            img.src = src;
        });
    };

    const helperImage = document.createElement('img');
    const load = async function () {
        const model = await window.mobilenet.load();
        const modelReference = referenceManager.createReference(model);
        return modelReference;
    };
    const classify = async function (modelReference, fileReference) {
        const model = referenceManager.getObject(modelReference);
        if (model === undefined) {
            throw new Error('Expected model reference');
        }
        await imageLoad(helperImage, fileReference);
        const results = await model.classify(helperImage);
        console.log(results);
    };
    window.WebVIMobileNet = {
        load,
        classify
    };
}());
