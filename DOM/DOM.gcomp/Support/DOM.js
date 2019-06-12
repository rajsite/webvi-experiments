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

    const validateObject = function (obj, constructorFunction) {
        if (obj instanceof constructorFunction === false) {
            const name = constructorFunction.name;
            const expectedNameMessage = (typeof name === 'string' && name !== '') ? `Expected a ${name} object instance.` : '';
            throw new Error('Invalid object.' + expectedNameMessage);
        }
    };

    const createDocumentFragment = function (fragmentContent, selectorsJSON) {
        const template = document.createElement('template');
        template.innerHTML = fragmentContent;
        const documentFragment = template.content.cloneNode(true);
        const selectors = JSON.parse(selectorsJSON);
        const elementReferences = selectors
            .map(selector => {
                const elements = documentFragment.querySelectorAll(selector);
                if (elements.length !== 1) {
                    throw new Error(`Expected fragment content to contain 1 element with selector ${selector} but found ${elements.length}. Fragment content: ${fragmentContent}`);
                }
                return elements[0];
            })
            .map(element => referenceManager.createReference(element));
        const documentFragmentReference = referenceManager.createReference(documentFragment);

        return JSON.stringify({
            documentFragmentReference,
            elementReferences
        });
    };

    // attributesJSON: [{name, value, remove}]
    const setAttributes = function (elementReference, attributesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(HTMLElement, element);
        const attributes = JSON.parse(attributesJSON);
        attributes.forEach(function ({name, value, remove}) {
            if (remove) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, value);
            }
        });
    };

    // TODO:
    // getAttributes
    // getProperties
    // setProperties
    // createElement
    // appendChild
    // querySelector
    // querySelectorAll
    // addEventListener
    // removeEventListener
    // classListAdd
    // classListRemove
    window.WebVIDOM = {
        createDocumentFragment,
        setAttributes
    };
}());
