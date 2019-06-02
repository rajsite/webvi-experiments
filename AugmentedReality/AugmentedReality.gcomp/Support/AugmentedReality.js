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

    const createScene = function (selector) {
        return new Promise(function (resolve) {
            const elements = document.querySelectorAll(selector);
            if (elements.length !== 1) {
                throw new Error(`Expected to find one element with selector ${selector}. Instead found ${elements.length} elements.`);
            }
            const element = elements[0];
            element.innerHTML = '';

            const scene = document.createElement('iframe');
            scene.style = 'width: 100%; height: 100%';

            // This will only work when a WebVI is executed in a Web Browser, it will not work if run in the editor
            scene.src = 'AugmentedReality/Support/AugmentedReality.html';
            scene.addEventListener('load', function () {
                const sceneReference = referenceManager.createReference(scene);
                resolve(sceneReference);
            });
            element.appendChild(scene);
        });
    };

    const destroyScene = function (sceneReference) {
        const scene = referenceManager.getObject(sceneReference);
        if (scene !== undefined) {
            referenceManager.closeReference(sceneReference);
            scene.parentNode.removeChild(scene);
        }
    };

    const createGLTFModel = function (sceneReference, src, attributesJSON) {
        return new Promise(function (resolve) {
            const scene = referenceManager.getObject(sceneReference);
            if (scene === undefined) {
                throw new Error('Scene reference is invalid');
            }

            const attributes = JSON.parse(attributesJSON);

            const gltfModel = scene.contentDocument.createElement('a-gltf-model');
            gltfModel.setAttribute('src', src);
            attributes.forEach(attribute => {
                gltfModel.setAttribute(attribute.name, attribute.value);
            });
            gltfModel.addEventListener('model-loaded', function () {
                const gltfModelReference = referenceManager.createReference(gltfModel);
                resolve(gltfModelReference);
            });
            const marker = scene.contentDocument.querySelector('a-marker');
            marker.appendChild(gltfModel);
        });
    };

    const destroyGLTFModel = function (gltfModelReference) {
        const gltfModel = referenceManager.getObject(gltfModelReference);
        if (gltfModel !== undefined) {
            referenceManager.closeReference(gltfModelReference);
            gltfModel.parentNode.removeChild(gltfModel);
        }
    };

    const updateGLTFModel = function (gltfModelReference, attributesJSON) {
        const gltfModel = referenceManager.getObject(gltfModelReference);
        if (gltfModel === undefined) {
            throw new Error('Invalid gltf reference');
        }

        const attributes = JSON.parse(attributesJSON);
        attributes.forEach(attribute => {
            gltfModel.setAttribute(attribute.name, attribute.value);
        });
    };

    window.WebVIAugmentedReality = {
        createScene,
        destroyScene,
        createGLTFModel,
        destroyGLTFModel,
        updateGLTFModel
    };
}());
