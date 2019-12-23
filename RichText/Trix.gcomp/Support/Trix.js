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

    const setDisableHelper = function (trix, disabled) {
        const {trixContainer, trixEditor} = trix;
        const enabled = !disabled;

        // Trix does not have built-in disabled behavior, used pattern from https://github.com/basecamp/trix/issues/331
        trixEditor.contentEditable = enabled;
        trixContainer.classList.toggle('webvi-trix-disable', disabled);
    };

    const create = function (selector, disabled) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, but found ${elements.length}`);
        }
        const element = elements[0];
        element.innerHTML = '';

        const trixContainer = document.createElement('div');
        trixContainer.classList.add('webvi-trix-container');

        const trixEditor = document.createElement('trix-editor');
        trixEditor.addEventListener('trix-file-accept', evt => evt.preventDefault());

        trixContainer.appendChild(trixEditor);
        element.appendChild(trixContainer);

        const trix = {
            trixContainer,
            trixEditor
        };

        setDisableHelper(trix, disabled);

        const trixReference = referenceManager.createReference(trix);
        return trixReference;
    };

    const destroy = function (trixReference) {
        const trix = referenceManager.getObject(trixReference);
        if (trix === undefined) {
            return;
        }
        const {trixContainer} = trix;
        trixContainer.parentNode.removeChild(trixContainer);
        referenceManager.closeReference(trixReference);
    };

    const getContent = function (trixReference) {
        const trix = referenceManager.getObject(trixReference);
        if (trix === undefined) {
            throw new Error('Expected instance of Trix object');
        }
        const {trixEditor} = trix;
        const content = trixEditor.value;
        return content;
    };

    const setContent = function (trixReference, content) {
        const trix = referenceManager.getObject(trixReference);
        if (trix === undefined) {
            throw new Error('Expected instance of Trix object');
        }
        const {trixEditor} = trix;
        trixEditor.value = content;
    };

    const setDisabled = function (trixReference, disabled) {
        const trix = referenceManager.getObject(trixReference);
        if (trix === undefined) {
            throw new Error('Expected instance of Trix object');
        }
        setDisableHelper(trix, disabled);
    };

    window.WebVITrix = {
        create,
        destroy,
        getContent,
        setContent,
        setDisabled
    };
}());
