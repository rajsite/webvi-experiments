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

    const setDisabledHelper = function (rooster, disabled) {
        const {roosterContainer} = rooster;
        const enabled = !disabled;

        // Rooster does not have built-in disabled behavior
        roosterContainer.contentEditable = enabled;
    };

    const create = function (selector, disabled) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, but found ${elements.length}`);
        }
        const element = elements[0];
        element.innerHTML = '';

        const roosterContainer = document.createElement('div');
        roosterContainer.classList.add('webvi-rooster-container');

        element.appendChild(roosterContainer);

        const roosterEditor = window.roosterjs.createEditor(roosterContainer);
        const rooster = {
            roosterContainer,
            roosterEditor
        };
        setDisabledHelper(rooster, disabled);
        const roosterReference = referenceManager.createReference(rooster);
        return roosterReference;
    };

    const destroy = function (roosterReference) {
        const rooster = referenceManager.getObject(roosterReference);
        if (rooster === undefined) {
            return;
        }
        referenceManager.closeReference(roosterReference);
        const {roosterContainer, roosterEditor} = rooster;
        roosterEditor.dispose();
        roosterContainer.parentNode.removeChild(roosterContainer);
    };

    const getContent = function (roosterReference) {
        const rooster = referenceManager.getObject(roosterReference);
        if (rooster === undefined) {
            throw new Error('Expected instance of Rooster object');
        }
        const {roosterEditor} = rooster;
        const content = roosterEditor.getContent();
        return content;
    };

    const setContent = function (roosterReference, content) {
        const rooster = referenceManager.getObject(roosterReference);
        if (rooster === undefined) {
            throw new Error('Expected instance of Rooster object');
        }
        const {roosterEditor} = rooster;
        roosterEditor.setContent(content);
    };

    const setDisabled = function (roosterReference, disabled) {
        const rooster = referenceManager.getObject(roosterReference);
        if (rooster === undefined) {
            throw new Error('Expected instance of Rooster object');
        }
        setDisabledHelper(rooster, disabled);
    };

    window.WebVIRooster = {
        create,
        destroy,
        getContent,
        setContent,
        setDisabled
    };
}());
