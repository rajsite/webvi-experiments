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

    const getDocumentTarget = function (documentTargetReference) {
        const documentTargetInitial = referenceManager.getObject(documentTargetReference);
        // eslint-disable-next-line no-undef
        const globalDocument = document;
        const documentTarget = documentTargetInitial === undefined ? globalDocument : documentTargetInitial;
        validateDOMObject(documentTarget, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        return documentTarget;
    };

    const querySelectorAll = function (documentTargetReference, selector) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        const elements = Array.from(documentTarget.querySelectorAll(selector));
        const elementReferences = elements.map(element => referenceManager.createReference(element));
        const elementReferencesJSON = JSON.stringify(elementReferences);
        return elementReferencesJSON;
    };

    const appendChild = function (parentReference, childReference, clearParentContent) {
        const parent = referenceManager.getObject(parentReference);
        validateDOMObject(parent, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const child = referenceManager.getObject(childReference);
        validateDOMObject(child, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        if (clearParentContent) {
            parent.innerHTML = '';
        }
        parent.appendChild(child);
    };

    // selectorsJSON: [selector]
    // fragmentAndElementsJSON {documentFragmentReference, elementReferences: [elementReference]}
    const createDocumentFragment = function (documentTargetReference, fragmentContent, selectorsJSON) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        // Use a template so the document fragment is inert. This way event listeners can be added, etc. before the element is attached to the DOM.
        const template = documentTarget.createElement('template');
        template.innerHTML = fragmentContent;
        const documentFragment = template.content;
        const selectors = JSON.parse(selectorsJSON);
        const elementReferences = selectors
            .map(selector => {
                const elements = Array.from(documentFragment.querySelectorAll(selector));
                if (elements.length !== 1) {
                    throw new Error(`Expected fragment content to contain 1 element with selector ${selector} but found ${elements.length}. Fragment content: ${fragmentContent}`);
                }
                return elements[0];
            })
            .map(element => referenceManager.createReference(element));
        const documentFragmentReference = referenceManager.createReference(documentFragment);
        const fragmentAndElementsJSON = JSON.stringify({
            documentFragmentReference,
            elementReferences
        });
        return fragmentAndElementsJSON;
    };

    const createElement = function (documentTargetReference, tagName) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        const template = documentTarget.createElement('template');
        // Use a template so the document fragment is inert. This way event listeners can be added, etc. before the element is attached to the DOM.
        // TODO figure out how to do this without using innerHTML. Using createElement doesn't work because the instance is live.
        template.innerHTML = `<${tagName}>`;
        const element = template.content.firstElementChild;
        if (element === null) {
            throw new Error(`Could not create element from tag name: ${tagName}`);
        }
        const elementReference = referenceManager.createReference(element);
        return elementReference;
    };

    // attributesJSON: [{name, value, remove}]
    const setAttributes = function (elementReference, attributesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const attributes = JSON.parse(attributesJSON);
        attributes.forEach(function ({name, value, remove}) {
            if (remove) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, value);
            }
        });
    };

    // namesJSON: [name]
    // attributeResultsJSON: [{name, value, found}]
    const getAttributes = function (elementReference, namesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const namesInitial = JSON.parse(namesJSON);
        const names = namesInitial.length === 0 ? element.getAttributeNames() : namesInitial;
        const attributeResults = names.map(function (name) {
            const valueInitial = element.getAttribute(name);
            const value = valueInitial === null ? '' : valueInitial;
            const found = valueInitial !== null;
            return {
                name,
                value,
                found
            };
        });
        const attributeResultsJSON = JSON.stringify(attributeResults);
        return attributeResultsJSON;
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

    // TODO pluralize
    // valueContainerJSON: {value: <propertyValue>}
    const getProperty = function (elementReference, propertyName) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const propertyNameParts = propertyName.split('.');
        // Mutates array by removing the last name part
        const lastNamePart = propertyNameParts.pop();
        const target = lookupTarget(element, propertyNameParts);
        const value = target[lastNamePart];
        const valueContainer = {value};
        const valueContainerJSON = JSON.stringify(valueContainer);
        return valueContainerJSON;
    };

    // TODO pluralize
    // valueContainerJSON: {value: <propertyValue>}
    const setProperty = function (elementReference, propertyName, valueContainerJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const valueContainer = JSON.parse(valueContainerJSON);
        const value = valueContainer.value;
        const propertyNameParts = propertyName.split('.');
        // Mutates array by removing the last name part
        const lastNamePart = propertyNameParts.pop();
        const target = lookupTarget(element, propertyNameParts);
        target[lastNamePart] = value;
    };

    // parametersConfigJSON: [parameterJSON]
    const invokeMethod = function (elementReference, methodName, parameterConfigsJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const parameterConfigs = JSON.parse(parameterConfigsJSON);
        const parameters = parameterConfigs.map(parameterConfig => JSON.parse(parameterConfig));
        const response = elementReference[methodName].apply(elementReference, parameters);
        const undefinedOrResponseJSON = (response === undefined || response === null) ? 'WEBVI_UNDEFINED' : JSON.stringify(response);
        return undefinedOrResponseJSON;
    };

    // TODO pluralize
    const classListAdd = function (elementReference, className) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        element.classList.add(className);
    };

    // TODO pluralize
    const classListRemove = function (elementReference, className) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        element.classList.remove(className);
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

    const convertEventtoJSON = function (event, eventConfigJSON) {
        const eventConfig = JSON.parse(eventConfigJSON);
        const result = Object.keys(eventConfig)
            .map(function (eventKey) {
                const eventValue = event[eventKey];
                const eventValueOrDefault = (eventValue === null || eventValue === undefined) ? eventConfig[eventKey] : eventValue;
                const eventResultSingle = {
                    eventKey,
                    eventValueOrDefault
                };
                return eventResultSingle;
            })
            .reduce(function (result, eventResultSingle) {
                result[eventResultSingle.eventKey] = eventResultSingle.eventValueOrDefault;
                return result;
            }, {});
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    class EventManager {
        constructor (element, eventName, eventConfigJSON) {
            this._element = element;
            this._eventName = eventName;
            this._queue = new DataQueue();
            this._handler = function (event) {
                const resultJSON = convertEventtoJSON(event, eventConfigJSON);
                this._queue.enqueue(resultJSON);
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

    const addEventListener = function (elementReference, eventName, eventConfigJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const eventManager = new EventManager(element, eventName, eventConfigJSON);
        const eventManagerReference = referenceManager.createReference(eventManager);
        return eventManagerReference;
    };

    const removeEventListener = function (eventManagerReference) {
        const eventManager = referenceManager.getObject(eventManagerReference);
        validateObject(eventManager, EventManager);
        eventManager.stop();
    };

    const waitForEvent = async function (eventManagerReference) {
        const eventManager = referenceManager.getObject(eventManagerReference);
        validateObject(eventManager, EventManager);
        const resultJSON = await eventManager.read();
        return resultJSON;
    };

    window.WebVIDOM = {
        // Build (TODO rename to Structure? Or Assemble?)
        appendChild,
        createDocumentFragment,
        createElement,
        // removeChild?

        // Configure
        classListAdd,
        classListRemove,
        setAttributes,
        getAttributes,
        getProperty,
        setProperty,

        // Monitor
        addEventListener,
        removeEventListener,
        waitForEvent,

        // Operate
        invokeMethod,

        // Search
        querySelectorAll

        // TODO how do we handle close?
        // Should we be somewhat magical? Calling appendChild on a DocumentFragment closes the reference?
        // I don't think element references should be closed automatically if removed from DOM, just document fragments (also because they can't be reused)
        // Should we handle property references seperately? Maybe not.. might want an element reference to a property.
        // Maybe we should only allow property references that are DOM objects? Or should this be a generic JavaScript Reflection api...
    };
}());
