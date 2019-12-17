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

    const ckeditorLoaded = function () {
        return new Promise(function (resolve) {
            if (!window.CKEDITOR) {
                throw new Error('CKEditor global not found.');
            }
            if (window.CKEDITOR.status === 'loaded') {
                resolve();
            } else {
                window.CKEDITOR.on('loaded', () => resolve());
            }
        });
    };

    const ckeditorInstanceReady = function (editor) {
        return new Promise(function (resolve) {
            if (editor.status === 'ready') {
                resolve();
            } else {
                editor.on('instanceReady', () => resolve());
            }
        });
    };

    const create = async function (selector) {
        const parents = document.querySelectorAll(selector);
        if (parents.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, instead found ${parents.length}`);
        }
        const parent = parents[0];
        parent.innerHTML = '';
        const placeholder = document.createElement('textarea');
        parent.appendChild(placeholder);

        await ckeditorLoaded();
        const config = {
            language: 'en',
            width: '100%',
            height: '100%'
        };
        const editor = window.CKEDITOR.replace(placeholder, config);
        await ckeditorInstanceReady(editor);
        editor.container.addClass('webvi-ckeditor-container');
        const editorReference = referenceManager.createReference(editor);
        return editorReference;
    };

    window.WebVICKEditor4 = {create};
}());
