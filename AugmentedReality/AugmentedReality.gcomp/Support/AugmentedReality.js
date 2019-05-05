(function () {
    'use strict';

    let nextRefnum = 1;
    class RefnumManager {
        constructor () {
            this.refnums = new Map();
        }

        createRefnum (obj) {
            const refnum = nextRefnum;
            nextRefnum += 1;
            this.refnums.set(refnum, obj);
            return refnum;
        }

        getObject (refnum) {
            return this.refnums.get(refnum);
        }

        closeRefnum (refnum) {
            this.refnums.delete(refnum);
        }
    }
    const refnumManager = new RefnumManager();

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
                const sceneRefnum = refnumManager.createRefnum(scene);
                resolve(sceneRefnum);
            });
            element.appendChild(scene);
        });
    };

    const destroyScene = function (sceneRefnum) {
        const scene = refnumManager.getObject(sceneRefnum);
        if (scene !== undefined) {
            refnumManager.closeRefnum(sceneRefnum);
            scene.parentNode.removeChild(scene);
        }
    };

    const createGLTFModel = function (sceneRefnum, src, attributesJSON) {
        return new Promise(function (resolve) {
            const scene = refnumManager.getObject(sceneRefnum);
            if (scene === undefined) {
                throw new Error('Scene refnum is invalid');
            }

            const attributes = JSON.parse(attributesJSON);

            const gltfModel = scene.contentDocument.createElement('a-gltf-model');
            gltfModel.setAttribute('src', src);
            attributes.forEach(attribute => {
                gltfModel.setAttribute(attribute.name, attribute.value);
            });
            gltfModel.addEventListener('model-loaded', function () {
                const gltfModelRefnum = refnumManager.createRefnum(gltfModel);
                resolve(gltfModelRefnum);
            });
            const marker = scene.contentDocument.querySelector('a-marker');
            marker.appendChild(gltfModel);
        });
    };

    const destroyGLTFModel = function (gltfModelRefnum) {
        const gltfModel = refnumManager.getObject(gltfModelRefnum);
        if (gltfModel !== undefined) {
            refnumManager.closeRefnum(gltfModelRefnum);
            gltfModel.parentNode.removeChild(gltfModel);
        }
    };

    const updateGLTFModel = function (gltfModelRefnum, attributesJSON) {
        const gltfModel = refnumManager.getObject(gltfModelRefnum);
        if (gltfModel === undefined) {
            throw new Error('Invalid gltf refnum');
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
