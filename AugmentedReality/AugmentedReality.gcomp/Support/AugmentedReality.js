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

    const setAttributesOnEntity = function (entity, attributesJSON) {
        const attributes = JSON.parse(attributesJSON);
        attributes.forEach(function (attribute) {
            const value = JSON.parse(attribute.valueJSON);
            entity.setAttribute(attribute.name, value.data);
        });
    };

    const createGLTFModelEntity = function (sceneReference, attributesJSON) {
        return new Promise(function (resolve) {
            const scene = referenceManager.getObject(sceneReference);
            if (scene === undefined) {
                throw new Error('Scene reference is invalid');
            }

            const entity = scene.contentDocument.createElement('a-gltf-model');
            setAttributesOnEntity(entity, attributesJSON);
            entity.addEventListener('model-loaded', function () {
                const entityReference = referenceManager.createReference(entity);
                resolve(entityReference);
            });
            const marker = scene.contentDocument.querySelector('a-marker');
            marker.appendChild(entity);
        });
    };

    const createEntity = function (sceneReference, attributesJSON) {
        const scene = referenceManager.getObject(sceneReference);
        if (scene === undefined) {
            throw new Error('Scene reference is invalid');
        }

        const entity = scene.contentDocument.createElement('a-entity');
        setAttributesOnEntity(entity, attributesJSON);
        const marker = scene.contentDocument.querySelector('a-marker');
        marker.appendChild(entity);
        const entityReference = referenceManager.createReference(entity);
        return entityReference;
    };

    const destroyEntity = function (entityReference) {
        const entity = referenceManager.getObject(entityReference);
        if (entity !== undefined) {
            referenceManager.closeReference(entityReference);
            entity.parentNode.removeChild(entity);
        }
    };

    const updateEntity = function (entityReference, attributesJSON) {
        const entity = referenceManager.getObject(entityReference);
        if (entity === undefined) {
            throw new Error('Invalid gltf reference');
        }

        setAttributesOnEntity(entity, attributesJSON);
    };

    window.WebVIAugmentedReality = {
        createScene,
        destroyScene,
        createGLTFModelEntity,
        createEntity,
        destroyEntity,
        updateEntity
    };
}());
