/* global Quill:false */
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

    const createQuill = function (selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, but found ${elements.length}`);
        }
        const element = elements[0];
        element.innerHTML = '';

        const quillContainer = document.createElement('div');
        quillContainer.classList.add('webvi-quill-container');
        const quillEditor = document.createElement('div');
        quillContainer.appendChild(quillEditor);
        element.appendChild(quillContainer);

        const quill = new Quill(quillEditor, {theme: 'snow'});
        const quillReference = referenceManager.createReference(quill);
        return quillReference;
    };

    const closeQuill = function (quillReference) {
        referenceManager.closeReference(quillReference);
    };

    const getContents = function (quillReference) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            throw new Error('Expected instance of Quill object');
        }
        const contents = quill.getContents();
        const contentsJSON = JSON.stringify(contents);
        return contentsJSON;
    };

    const setContents = function (quillReference, contentsJSON) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            throw new Error('Expected instance of Quill object');
        }
        const contents = JSON.parse(contentsJSON);
        quill.setContents(contents);
    };

    const enable = function (quillReference, contentsJSON, ) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            throw new Error('Expected instance of Quill object');
        }
        const contents = JSON.parse(contentsJSON);
        quill.setContents(contents);
    };

    window.WebVIQuill = {
        createQuill,
        closeQuill,
        getContents,
        setContents,
        enable
    };
}());
