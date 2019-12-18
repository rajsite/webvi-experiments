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

    const create = async function (selector, disabled) {
        const parents = document.querySelectorAll(selector);
        if (parents.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, instead found ${parents.length}`);
        }
        const parent = parents[0];
        parent.innerHTML = '';

        await ckeditorLoaded();
        const config = {
            language: 'en',
            width: '100%',
            height: '100%',
            readOnly: disabled
        };
        const editor = window.CKEDITOR.appendTo(parent, config);
        await ckeditorInstanceReady(editor);
        editor.container.addClass('webvi-ckeditor-container');
        const editorReference = referenceManager.createReference(editor);
        return editorReference;
    };

    const destroy = function (editorReference) {
        const editor = referenceManager.getObject(editorReference);
        if (editor === undefined) {
            return;
        }
        referenceManager.closeReference(editorReference);
        editor.destroy();
    };

    const getContent = function (editorReference) {
        const editor = referenceManager.getObject(editorReference);
        if (editor === undefined) {
            throw new Error('Expected instance of CKEditor object.');
        }
        return editor.getData();
    };

    const ckeditorSetData = function (editor, content) {
        return new Promise(function (resolve) {
            editor.setData(content, {callback: () => resolve()});
        });
    };

    const setContent = async function (editorReference, content) {
        const editor = referenceManager.getObject(editorReference);
        if (editor === undefined) {
            throw new Error('Expected instance of CKEditor object.');
        }

        await ckeditorSetData(editor, content);
    };

    window.WebVICKEditor4 = {
        create,
        destroy,
        getContent,
        setContent
    };
}());
