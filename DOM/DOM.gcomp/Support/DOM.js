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

    // Closing a DOM reference does not remove it from the DOM
    const closeDOMReferences = function (domReferencesTypedArray) {
        const domReferences = Array.from(domReferencesTypedArray);
        domReferences.forEach(domReference => referenceManager.closeReference(domReference));
    };

    const getDOMTargetOrGlobalDocument = function (domTargetReference, ...allowedDOMTypes) {
        const domTargetInitial = referenceManager.getObject(domTargetReference);
        const globalDocument = window.document;
        const domTarget = domTargetInitial === undefined ? globalDocument : domTargetInitial;
        validateDOMObject(domTarget, ...allowedDOMTypes);
        return domTarget;
    };

    const querySelectors = function (domTargetReference, selectorsJSON) {
        const domTarget = getDOMTargetOrGlobalDocument(domTargetReference, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE);
        const selectors = JSON.parse(selectorsJSON);
        const elementReferences = selectors.map(function (selector) {
            const elements = domTarget.querySelectorAll(selector);
            if (elements.length !== 1) {
                throw new Error(`Expected 1 element with selector ${selector} but found ${elements.length}`);
            }
            const element = elements[0];
            return element;
        }).map(element => referenceManager.createReference(element));
        const elementReferencesTypedArray = new Int32Array(elementReferences);
        return elementReferencesTypedArray;
    };

    const querySelectorAll = function (domTargetReference, selector) {
        const domTarget = getDOMTargetOrGlobalDocument(domTargetReference, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE);
        const elements = Array.from(domTarget.querySelectorAll(selector));
        const elementReferences = elements.map(element => referenceManager.createReference(element));
        const elementReferencesTypedArray = new Int32Array(elementReferences);
        return elementReferencesTypedArray;
    };

    const appendChildren = function (parentReference, childReferencesTypedArray, clearParentContent) {
        const parent = referenceManager.getObject(parentReference);
        validateDOMObject(parent, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const childReferences = Array.from(childReferencesTypedArray);
        const children = childReferences.map(function (childReference) {
            const child = referenceManager.getObject(childReference);
            validateDOMObject(child, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
            return child;
        });

        if (clearParentContent) {
            parent.innerHTML = '';
        }
        children.forEach(child => parent.appendChild(child));
    };

    const removeChildren = function (childReferencesTypedArray) {
        const childReferences = Array.from(childReferencesTypedArray);
        const children = childReferences.map(function (childReference) {
            const child = referenceManager.getObject(childReference);
            validateDOMObject(child, ELEMENT_NODE);
            return child;
        });
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

    const createElements = function (documentTargetReference, tagNamesJSON, isInert) {
        const documentTarget = getDOMTargetOrGlobalDocument(documentTargetReference, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const tagNames = JSON.parse(tagNamesJSON);
        const elements = isInert ? createElementsInert(documentTarget, tagNames) : createElementsLive(documentTarget, tagNames);
        const elementReferences = elements.map(element => referenceManager.createReference(element));
        const elementReferencesTypedArray = new Int32Array(elementReferences);
        return elementReferencesTypedArray;
    };

    const createDocumentFragment = function (documentTargetReference, content, isInert) {
        const documentTarget = getDOMTargetOrGlobalDocument(documentTargetReference, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const documentFragment = createDocumentFragmentInertable(documentTarget, content, isInert);
        const documentFragmentReference = referenceManager.createReference(documentFragment);
        return documentFragmentReference;
    };

    const getAttributes = function (elementReference, attributeNamesJSON) {
        const element = referenceManager.getObject(elementReference);
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

    const getProperties = function (elementReference, propertyNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        const domValues = createPropertyDomValues(element, propertyNames);
        const domValuesJSON = JSON.stringify(domValues);
        return domValuesJSON;
    };

    const setDomValues = function (elementReference, domValuesJSON) {
        const element = referenceManager.getObject(elementReference);
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

    const getReferences = function (elementReference, propertyNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        const references = propertyNames.map(function (name) {
            const nameParts = name.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = nameParts.pop();
            const target = lookupTarget(element, nameParts);
            const value = target[lastNamePart];
            const reference = referenceManager.createReference(value);
            return reference;
        });
        const referencesTypedArray = new Int32Array(references);
        return referencesTypedArray;
    };

    const setReferences = function (elementReference, propertyNamesJSON, referencesTypedArray) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        propertyNames.forEach(function (name, index) {
            const reference = referencesTypedArray[index];
            const value = ReferenceManager.getObject(reference);
            const nameParts = name.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = nameParts.pop();
            const target = lookupTarget(element, nameParts);
            target[lastNamePart] = value;
        });
    };

    const invokeElementMethod = async function (elementReference, methodName, parameterDomValuesJSON) {
        const element = referenceManager.getObject(elementReference);
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

    class DataQueue {
        constructor () {
            this.queue = [];
            this.pendingResolve = undefined;
            this.pendingReject = undefined;
        }

        enqueue (data) {
            if (this.queue === undefined) {
                throw new Error(`The queue has already been destroyed, cannot enqueue new data: ${data}`);
            }

            this.queue.push(data);

            if (this.pendingResolve !== undefined) {
                this.pendingResolve(this.queue.shift());
                this.pendingResolve = undefined;
                this.pendingReject = undefined;
            }
        }

        dequeue () {
            if (this.queue === undefined) {
                throw new Error('The queue has already been destroyed, cannot dequeue any data.');
            }

            if (this.pendingResolve !== undefined) {
                throw new Error('A pending dequeue operation already exists. Only one pending dequeue operation allowed at a time.');
            }

            if (this.queue.length === 0) {
                return new Promise((resolve, reject) => {
                    this.pendingResolve = resolve;
                    this.pendingReject = reject;
                });
            }

            return this.queue.shift();
        }

        destroy () {
            if (this.pendingResolve !== undefined) {
                this.pendingReject(new Error('Pending dequeue operation failed due to queue destruction.'));
                this.pendingResolve = undefined;
                this.pendingReject = undefined;
            }
            this.pendingResolve = undefined;

            const remaining = this.queue;
            this.queue = undefined;
            return remaining;
        }
    }

    class EventManager {
        constructor (element, eventName, propertyNames) {
            this._element = element;
            this._eventName = eventName;
            this._queue = new DataQueue();
            this._handler = (event) => {
                const domValues = createPropertyDomValues(event, propertyNames);
                this._queue.enqueue(domValues);
            };
            this._element.addEventListener(this._eventName, this._handler);
        }

        read () {
            return this._queue.dequeue();
        }

        stop () {
            this._element.removeEventListener(this._eventName, this._handler);
            this._handler = undefined;
            this._queue.destroy();
            this._queue = undefined;
            this._eventName = undefined;
            this._element = undefined;
        }
    }

    const validateObject = function (obj, ...constructorFunctions) {
        const constructorFunction = constructorFunctions.find(constructorFunction => obj instanceof constructorFunction);
        if (constructorFunction === undefined) {
            const names = constructorFunctions.map(constructorFunction => constructorFunction.name === '' ? 'UNKNOWN_NAME' : constructorFunction.name).join(',');
            const expectedNameMessage = names === '' ? '' : ` Expected an instance of one of the following: ${names}.`;
            throw new Error('Invalid object.' + expectedNameMessage);
        }
    };

    const addEventListener = function (elementReference, eventName, propertyNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        const eventManager = new EventManager(element, eventName, propertyNames);
        const eventManagerReference = referenceManager.createReference(eventManager);
        return eventManagerReference;
    };

    const removeEventListener = function (eventManagerReference) {
        const eventManager = referenceManager.getObject(eventManagerReference);
        validateObject(eventManager, EventManager);
        referenceManager.closeReference(eventManagerReference);
        eventManager.stop();
    };

    const waitForEvent = async function (eventManagerReference) {
        const eventManager = referenceManager.getObject(eventManagerReference);
        validateObject(eventManager, EventManager);
        const domValues = await eventManager.read();
        const domValuesJSON = JSON.stringify(domValues);
        return domValuesJSON;
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
        closeDOMReferences
    };
}());
