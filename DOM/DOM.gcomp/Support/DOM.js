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

    const validateObject = function (obj, ...args) {
        const constructorFunction = args.find(constructorFunction => obj instanceof constructorFunction);
        if (constructorFunction === undefined) {
            const names = args.map(constructorFunction => constructorFunction.name === '' ? 'UNKNOWN_NAME' : constructorFunction.name).join(',');
            const expectedNameMessage = names === '' ? '' : ` Expected an instance of one of the following: ${names}.`;
            throw new Error('Invalid object.' + expectedNameMessage);
        }
    };

    const appendChild = function (parentElementReference, elementOrDocumentFragmentReference) {
        const parentElement = referenceManager.getObject(parentElementReference);
        validateObject(parentElement, HTMLElement);
        const elementOrDocumentFragment = referenceManager.getObject(elementOrDocumentFragmentReference);
        validateObject(elementOrDocumentFragment, HTMLElement, DocumentFragment);
        parentElement.appendChild(elementOrDocumentFragment);
    };

    // selectorsJSON: [selector]
    const createDocumentFragment = function (fragmentContent, selectorsJSON) {
        const template = document.createElement('template');
        template.innerHTML = fragmentContent;
        const documentFragment = template.content;
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

    const createElement = function (tagName) {
        var template = document.createElement('template');
        template.content.appendChild(document.createElement(tagName));
        var element = template.content.firstElementChild;
        const elementReference = referenceManager.createReference(element);
        return elementReference;
    };

    // attributesJSON: [{name, value, remove}]
    const setAttributes = function (elementReference, attributesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
        const attributes = JSON.parse(attributesJSON);
        attributes.forEach(function ({name, value, remove}) {
            if (remove) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, value);
            }
        });
    };

    // attributeConfigsJSON: [{name, default}]
    // attributeResultsJSON: [{name, value, found}]
    const getAttributes = function (elementReference, attributeConfigsJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
        const attributeConfigsInitial = JSON.parse(attributeConfigsJSON);
        const attributeConfigs = attributeConfigsInitial.length === 0 ? element.getAttributes().map(name => ({name, default: ''})) : attributeConfigsInitial;
        const attributeResults = attributeConfigs.map(function (attributeConfig) {
            const valueInitial = element.getAttribute(attributeConfig.name);
            const value = valueInitial === null ? attributeConfig.default : valueInitial;
            const found = valueInitial === null ? false : true;
            return {
                name,
                value,
                found
            }
        });
        const attributeResultsJSON = JSON.stringify(attributeResults);
        return attributeResultsJSON;
    };

    // TODO:
    // getProperties
    // setProperties
    // querySelectorAll
    // addEventListener
    // removeEventListener
    // classListAdd
    // classListRemove
    window.WebVIDOM = {
        appendChild,
        createDocumentFragment,
        createElement,
        setAttributes,
        getAttributes
    };
}());
