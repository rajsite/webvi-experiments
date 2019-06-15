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

    const querySelectorAll = function (selector, documentTargetReference) {
        const documentTargetInitial = referenceManager.getObject(documentTargetReference);
        const documentTarget = documentTargetInitial === undefined ? document : documentTargetInitial;
        validateObject(documentTarget, Document, DocumentFragment);
        const elements = Array.from(documentTarget.querySelectorAll(selector));
        const elementReferences = elements.map(element => referenceManager.createReference(element));
        const elementReferencesJSON = JSON.stringify(elementReferences);
        return elementReferencesJSON;
    };

    const appendChild = function (parentReference, childReference, clearParentContent) {
        const parent = referenceManager.getObject(parentReference);
        validateObject(parent, HTMLElement, DocumentFragment);
        const child = referenceManager.getObject(childReference);
        validateObject(child, HTMLElement, DocumentFragment);
        if (clearParentContent) {
            parent.innerHTML = '';
        }
        parent.appendChild(child);
    };

    // selectorsJSON: [selector]
    // fragmentAndElementsJSON {documentFragmentReference, elementReferences: [elementReference]}
    const createDocumentFragment = function (fragmentContent, selectorsJSON) {
        const template = document.createElement('template');
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

    const createElement = function (tagName) {
        const template = document.createElement('template');
        template.content.appendChild(document.createElement(tagName));
        const element = template.content.firstElementChild;
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

    // namesJSON: [name]
    // attributeResultsJSON: [{name, value, found}]
    const getAttributes = function (elementReference, namesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
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

    // Returns either the invalid JSON string 'WEBVI_UNDEFINED' if the property value is null or undefined
    // otherwise returns a valid JSON representation of the property value
    // TODO support nested properties, ie el.position.x
    const getProperty = function (elementReference, propertyName) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
        const value = element[propertyName];
        const undefinedOrValueJSON = (value === undefined || value === null) ? 'WEBVI_UNDEFINED' : JSON.stringify(value);
        return undefinedOrValueJSON;
    };

    const setProperty = function (elementReference, propertyName, valueJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
        const value = JSON.parse(valueJSON);
        element[propertyName] = value;
    };

    // parametersConfigJSON: [parameterJSON]
    const invokeMethod = function (elementReference, methodName, parameterConfigsJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
        const parameterConfigs = JSON.parse(parameterConfigsJSON);
        const parameters = parameterConfigs.map(parameterConfig => JSON.parse(parameterConfig));
        const response = elementReference[methodName].apply(elementReference, parameters);
        const undefinedOrResponseJSON = (response === undefined || response === null) ? 'WEBVI_UNDEFINED' : JSON.stringify(response);
        return undefinedOrResponseJSON;
    };

    const classListAdd = function (elementReference, className) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
        element.classList.add(className);
    };

    const classListRemove = function (elementReference, className) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
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

    const addEventListener = function (elementReference, eventName, eventConfigJSON) {
        const element = referenceManager.getObject(elementReference);
        validateObject(element, HTMLElement);
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
        querySelectorAll,
        appendChild,
        createDocumentFragment,
        createElement,
        setAttributes,
        getAttributes,
        getProperty,
        setProperty,
        invokeMethod,
        classListAdd,
        classListRemove,
        addEventListener,
        removeEventListener,
        waitForEvent
    };
}());
