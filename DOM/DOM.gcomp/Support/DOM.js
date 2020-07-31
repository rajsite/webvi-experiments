(function () {
    'use strict';

    // We use el.nodeType instead of instanceof checks to handle iframe and document fragments
    const DOCUMENT_NODE = 'DOCUMENT_NODE';
    const DOCUMENT_FRAGMENT_NODE = 'DOCUMENT_FRAGMENT_NODE';
    const ELEMENT_NODE = 'ELEMENT_NODE';
    const NODE_TYPE_NAMES = {
        [DOCUMENT_NODE]: window.Node.DOCUMENT_NODE,
        [DOCUMENT_FRAGMENT_NODE]: window.Node.DOCUMENT_FRAGMENT_NODE,
        [ELEMENT_NODE]: window.Node.ELEMENT_NODE
    };

    const validateDOMObject = function (obj, ...nodeTypeNames) {
        if (typeof obj !== 'object' || obj === null) {
            throw new Error('Invalid object. Expected a DOM Object.');
        }
        const nodeTypeName = nodeTypeNames.find(nodeTypeName => obj.nodeType === NODE_TYPE_NAMES[nodeTypeName]);
        if (nodeTypeName === undefined) {
            throw new Error(`Invalid object. Expected an instance of one of the following: ${nodeTypeNames.join(',')}`);
        }
    };

    const querySelectors = function (domTarget, selectorsJSON) {
        validateDOMObject(domTarget, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE);
        const selectors = JSON.parse(selectorsJSON);
        const elements = selectors.map(function (selector) {
            const elements = domTarget.querySelectorAll(selector);
            if (elements.length !== 1) {
                throw new Error(`Expected 1 element with selector ${selector} but found ${elements.length}`);
            }
            const [element] = elements;
            return element;
        });
        return elements;
    };

    const querySelectorAll = function (domTarget, selector) {
        validateDOMObject(domTarget, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE);
        const elements = Array.from(domTarget.querySelectorAll(selector));
        return elements;
    };

    const appendChildren = function (parent, children, clearParentContent) {
        validateDOMObject(parent, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        children.forEach(child => validateDOMObject(child, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE));
        if (clearParentContent) {
            parent.innerHTML = '';
        }
        children.forEach(child => parent.appendChild(child));
    };

    const removeChildren = function (children) {
        children.forEach(child => validateDOMObject(child, ELEMENT_NODE));
        children.forEach(function (child) {
            if (child.parentNode !== null) {
                child.parentNode.removeChild(child);
            }
        });
    };

    const escapeHTMLHelper = window.document.createElement('div');
    const escapeHTML = function (unescapedHTMLText) {
        escapeHTMLHelper.textContent = unescapedHTMLText;
        const escapedHTMLText = escapeHTMLHelper.innerHTML;
        escapeHTMLHelper.textContent = '';
        return escapedHTMLText;
    };

    // const unescapeHTMLHelper = window.document.createElement('textarea');
    // const unescapeHTML = function (escapedHTMLText) {
    //     unescapeHTMLHelper.innerHTML = escapedHTMLText;
    //     const unescapedHTMLText = unescapeHTMLHelper.value;
    //     unescapeHTMLHelper.innerHTML = '';
    //     return unescapedHTMLText;
    // };

    const createDocumentFragmentFromTemplate = function (documentTarget, content) {
        const template = documentTarget.createElement('template');
        template.innerHTML = content;
        return template.content;
    };

    const createDocumentFragmentFromRange = function (documentTarget, content) {
        return documentTarget.createRange().createContextualFragment(content);
    };

    const createDocumentFragmentInertable = function (documentTarget, content, isInert) {
        const documentFragment = isInert ? createDocumentFragmentFromTemplate(documentTarget, content) : createDocumentFragmentFromRange(documentTarget, content);
        return documentFragment;
    };

    const createElementsInert = function (documentTarget, tagNames) {
        // Escape tag names to catch unexpected HTML insertion
        const content = tagNames
            .map(tagName => escapeHTML(tagName))
            .map(tagNameEscaped => `<${tagNameEscaped}></${tagNameEscaped}>`)
            .join('');
        const documentFragment = createDocumentFragmentInertable(documentTarget, content, true);
        // Rely of document order traversal of querySelectorAll
        const elements = Array.from(documentFragment.querySelectorAll('*'));
        if (tagNames.length !== elements.length) {
            throw new Error(`Creating ${tagNames.length} tags resulted in ${elements.length} elements. Check that all tag names are valid: ${tagNames.join(',')}`);
        }
        tagNames.forEach((tagName, index) => {
            if (tagName.toLowerCase() !== elements[index].tagName.toLowerCase()) {
                throw new Error(`Resulting tag name from input ${tagName} resulted in unexpected output tag name ${elements[index].tagName}`);
            }
        });
        return elements;
    };

    const createElementsLive = function (documentTarget, tagNames) {
        const elements = tagNames.map(tagName => documentTarget.createElement(tagName));
        return elements;
    };

    const createElements = function (documentTarget, tagNamesJSON, isInert) {
        validateDOMObject(documentTarget, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const tagNames = JSON.parse(tagNamesJSON);
        const elements = isInert ? createElementsInert(documentTarget, tagNames) : createElementsLive(documentTarget, tagNames);
        return elements;
    };

    const createDocumentFragment = function (documentTarget, content, isInert) {
        validateDOMObject(documentTarget, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const documentFragment = createDocumentFragmentInertable(documentTarget, content, isInert);
        return documentFragment;
    };

    const getAttributes = function (element, attributeNamesJSON) {
        validateDOMObject(element, ELEMENT_NODE);
        const attributeNamesInitial = JSON.parse(attributeNamesJSON);
        const attributeNames = attributeNamesInitial.length === 0 ? element.getAttributeNames() : attributeNamesInitial;
        const domValues = attributeNames.map(function (name) {
            const valueInitial = element.getAttribute(name);
            const exists = valueInitial !== null;
            const type = exists ? 'attribute' : 'absent';
            const value = exists ? valueInitial : '';
            const domValue = {
                type,
                name,
                value
            };
            return domValue;
        });
        const domValuesJSON = JSON.stringify(domValues);
        return domValuesJSON;
    };

    const lookupTarget = function (base, propertyNameParts) {
        const target = propertyNameParts.reduce(function (currentTarget, namePart) {
            const nextTarget = currentTarget[namePart];
            if (nextTarget === undefined || nextTarget === null) {
                throw new Error(`Cannot find sub-property with name ${namePart}`);
            }
            return nextTarget;
        }, base);
        return target;
    };

    const createPropertyDomValue = function (name, value) {
        const domValue = {
            type: '',
            name,
            value: ''
        };
        if (value === undefined || value === null) {
            domValue.type = 'undefined';
            // domValue.value stays empty string
        } else if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            domValue.type = typeof value;
            domValue.value = String(value);
        } else {
            throw new Error(`Property value with name ${name} is unsupported type.`);
        }
        return domValue;
    };

    const createPropertyDomValues = function (base, names) {
        const domValues = names.map(function (name) {
            const nameParts = name.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = nameParts.pop();
            const target = lookupTarget(base, nameParts);
            const value = target[lastNamePart];
            const domValue = createPropertyDomValue(name, value);
            return domValue;
        });
        return domValues;
    };

    const evaluatePropertyDomValue = function (domValue) {
        const {type, value} = domValue;
        if (type === 'undefined') {
            const propertyValue = undefined;
            return propertyValue;
        } else if (type === 'number') {
            const propertyValue = Number(value);
            return propertyValue;
        } else if (type === 'string') {
            return value;
        } else if (type === 'boolean') {
            const propertyValue = Boolean(value);
            return propertyValue;
        }
        throw new Error(`Unexpected property value type ${type}`);
    };

    const getProperties = function (element, propertyNamesJSON) {
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        const domValues = createPropertyDomValues(element, propertyNames);
        const domValuesJSON = JSON.stringify(domValues);
        return domValuesJSON;
    };

    const setDomValues = function (element, domValuesJSON) {
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);

        const domValues = JSON.parse(domValuesJSON);
        domValues.forEach(function (domValue) {
            if (domValue.type === 'attribute') {
                element.setAttribute(domValue.name, domValue.value);
            } else if (domValue.type === 'absent') {
                element.removeAttribute(domValue.name);
            } else {
                const nameParts = domValue.name.split('.');
                // Mutates array by removing the last name part
                const lastNamePart = nameParts.pop();
                const target = lookupTarget(element, nameParts);
                const value = evaluatePropertyDomValue(domValue);
                target[lastNamePart] = value;
            }
        });
    };

    const getReferences = function (element, propertyNamesJSON) {
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        const values = propertyNames.map(function (name) {
            const nameParts = name.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = nameParts.pop();
            const target = lookupTarget(element, nameParts);
            const value = target[lastNamePart];
            return value;
        });
        return values;
    };

    const setReferences = function (element, propertyNamesJSON, values) {
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        propertyNames.forEach(function (name, index) {
            const value = values[index];
            const nameParts = name.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = nameParts.pop();
            const target = lookupTarget(element, nameParts);
            target[lastNamePart] = value;
        });
    };

    const invokeElementMethod = async function (element, methodName, parameterDomValuesJSON) {
        validateDOMObject(element, ELEMENT_NODE);
        const methodNameParts = methodName.split('.');
        // Mutates array by removing the last name part
        const lastNamePart = methodNameParts.pop();
        const context = lookupTarget(element, methodNameParts);
        const method = context[lastNamePart];
        if (typeof method !== 'function') {
            throw new Error(`Value at name ${methodName} is not a callable function`);
        }

        const parameterDomValues = JSON.parse(parameterDomValuesJSON);
        const parameters = parameterDomValues.map(parameterDomValue => evaluatePropertyDomValue(parameterDomValue));
        const returnValue = await method.apply(context, parameters);
        const returnDomValue = createPropertyDomValue('return', returnValue);
        const returnDomValues = [returnDomValue];
        const returnDomValuesJSON = JSON.stringify(returnDomValues);
        return returnDomValuesJSON;
    };

    const validateEventStreamReader = function (eventStreamReader) {
        // NXG 5 does not include the ReadableStreamDefaultReader in the global scope so skip validation
        if (window.ReadableStreamDefaultReader === undefined) {
            return;
        }
        if (eventStreamReader instanceof window.ReadableStreamDefaultReader === false) {
            throw new Error('Input is not a valid event stream reader');
        }
    };

    const addEventListener = function (eventTarget, eventName, propertyNamesJSON) {
        const propertyNames = JSON.parse(propertyNamesJSON);
        let eventHandler;
        const eventStream = new window.ReadableStream({
            start (controller) {
                eventHandler = function (event) {
                    const domValues = createPropertyDomValues(event, propertyNames);
                    controller.enqueue(domValues);
                };
                eventTarget.addEventListener(eventName, eventHandler);
            },
            cancel () {
                eventTarget.removeEventListener(eventName, eventHandler);
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const removeEventListener = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        await eventStreamReader.cancel();
    };

    const waitForEvent = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        const {value} = await eventStreamReader.read();
        const domValuesJSON = JSON.stringify(value);
        return domValuesJSON;
    };

    const getGlobalDocument = function () {
        return window.document;
    };

    window.WebVIDOM = {
        // Build
        appendChildren,
        createDocumentFragment,
        createElements,
        removeChildren,

        // Configure
        getAttributes,
        getProperties,
        getReferences,
        setDomValues,
        setReferences,

        // Monitor
        addEventListener,
        removeEventListener,
        waitForEvent,

        // Operate
        invokeElementMethod,

        // Search
        querySelectorAll,
        querySelectors,

        // Shared
        getGlobalDocument
    };
}());
