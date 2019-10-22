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

        // Workaround for header size https://github.com/quilljs/quill/issues/1285
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        const container = document.createElement('div');
        element.appendChild(container);
        const quill = new window.Quill(container, {theme: 'snow'});
        const quillReference = referenceManager.createReference(quill);
        return quillReference;
    };

    const closeQuill = function (quillReference) {
        referenceManager.closeReference(quillReference);
    };

    window.WebVIQuill = {
        createQuill,
        closeQuill
    };
}());
