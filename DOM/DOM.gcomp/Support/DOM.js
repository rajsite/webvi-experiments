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
        // TODO any better way to check if dom object across contexts?
        const nodeTypeName = nodeTypeNames.find(nodeTypeName => obj.nodeType === NODE_TYPE_NAMES[nodeTypeName]);
        if (nodeTypeName === undefined) {
            throw new Error(`Invalid object. Expected an instance of one of the following: ${nodeTypeNames.join(',')}`);
        }
    };

    const getDocumentTarget = function (documentTargetReference) {
        const documentTargetInitial = referenceManager.getObject(documentTargetReference);
        const globalDocument = window.document;
        const documentTarget = documentTargetInitial === undefined ? globalDocument : documentTargetInitial;
        validateDOMObject(documentTarget, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        return documentTarget;
    };

    const querySelectors = function (documentTargetReference, selectorsJSON) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        const selectors = JSON.parse(selectorsJSON);
        const elementReferences = selectors.map(function (selector) {
            const elements = documentTarget.querySelectorAll(selector);
            if (elements.length !== 1) {
                throw new Error(`Expected 1 element with selector ${selector} but found ${elements.length}`);
            }
            const element = elements[0];
            return element;
        }).map(element => referenceManager.createReference(element));
        const elementReferencesJSON = JSON.stringify(elementReferences);
        return elementReferencesJSON;
    };

    const querySelectorAll = function (documentTargetReference, selector) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        const elements = Array.from(documentTarget.querySelectorAll(selector));
        const elementReferences = elements.map(element => referenceManager.createReference(element));
        const elementReferencesJSON = JSON.stringify(elementReferences);
        return elementReferencesJSON;
    };

    const appendChildren = function (parentReference, childReferencesJSON, clearParentContent) {
        const parent = referenceManager.getObject(parentReference);
        validateDOMObject(parent, ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE);
        const childReferences = JSON.parse(childReferencesJSON);
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

    const createDocumentFragment = function (documentTargetReference, fragmentContent) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        // Use a template so the document fragment is inert. This way event listeners can be added, etc. before the element is attached to the DOM.
        const template = documentTarget.createElement('template');
        template.innerHTML = fragmentContent;
        const documentFragment = template.content;
        const documentFragmentReference = referenceManager.createReference(documentFragment);
        return documentFragmentReference;
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

    const createElements = function (documentTargetReference, tagNamesJSON) {
        const documentTarget = getDocumentTarget(documentTargetReference);
        const tagNames = JSON.parse(tagNamesJSON);
        // Escape tag names to catch unexpected HTML insertion
        const tagNamesContent = tagNames
            .map(tagName => escapeHTML(tagName))
            .map(tagNameEscaped => `<${tagNameEscaped}></${tagNameEscaped}>`)
            .join('');
        // Use a template so the document fragment is inert. This way event listeners can be added, etc. before the element is attached to the DOM.
        const template = documentTarget.createElement('template');
        template.innerHTML = tagNamesContent;
        // Rely of document order traversal of querySelectorAll
        const elements = Array.from(template.content.querySelectorAll('*'));
        if (tagNames.length !== elements.length) {
            throw new Error(`Creating ${tagNames.length} tags resulted in ${elements.length} elements. Check that all tag names are valid: ${tagNames.join(',')}`);
        }
        tagNames.forEach((tagName, index) => {
            if (tagName.toLowerCase() !== elements[index].tagName.toLowerCase()) {
                throw new Error(`Resulting tag name from input ${tagName} resulted in unexpected output tag name ${elements[index].tagName}`);
            }
        });
        const elementReferences = elements.map(element => referenceManager.createReference(element));
        const elementReferencesJSON = JSON.stringify(elementReferences);
        return elementReferencesJSON;
    };

    // attributeValueConfigsJSON: [{attributeValue, exists}]
    const setAttributes = function (elementReference, attributeNamesJSON, attributeValueConfigsJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const attributeNames = JSON.parse(attributeNamesJSON);
        const attributeValueConfigs = JSON.parse(attributeValueConfigsJSON);

        if (attributeNames.length !== attributeValueConfigs.length) {
            throw new Error('Must provide an equal number of attribute names and attribute values to set');
        }

        attributeNames.forEach(function (attributeName, index) {
            const attributeValueConfig = attributeValueConfigs[index];
            const {attributeValue, exists} = attributeValueConfig;
            if (exists) {
                element.setAttribute(attributeName, attributeValue);
            } else {
                element.removeAttribute(attributeName);
            }
        });
    };

    // attributeValueResultsJSON : {attributeNames: [attributeName], attributeValueConfigs: [{attributeValue, exists}]}
    const getAttributes = function (elementReference, attributeNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const attributeNamesInitial = JSON.parse(attributeNamesJSON);
        const attributeNames = attributeNamesInitial.length === 0 ? element.getAttributeNames() : attributeNamesInitial;
        const attributeValueConfigs = attributeNames.map(function (attributeName) {
            const attributeValueInitial = element.getAttribute(attributeName);
            const exists = attributeValueInitial !== null;
            const attributeValue = attributeValueInitial === null ? '' : attributeValueInitial;
            const attributeValueConfig = {
                attributeValue,
                exists
            };
            return attributeValueConfig;
        });
        const attributeValueResults = {
            attributeNames,
            attributeValueConfigs
        };
        const attributeValueResultsJSON = JSON.stringify(attributeValueResults);
        return attributeValueResultsJSON;
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

    const createPropertyValueConfig = function (propertyValue) {
        const propertyValueConfig = {
            type: '',
            propertyValueJSON: ''
        };
        if (propertyValue === undefined || propertyValue === null) {
            propertyValueConfig.type = 'undefined';
            // propertyValueConfig.propertyValueJSON is unused for this type
        } else if (typeof propertyValue === 'number' || typeof propertyValue === 'string' || typeof propertyValue === 'boolean') {
            propertyValueConfig.type = typeof propertyValue;
            propertyValueConfig.propertyValueJSON = JSON.stringify({data: propertyValue});
        } else if (typeof propertyValue === 'object' && propertyValue !== null) {
            // TODO any better way to check if dom object across contexts?
            if (Object.values(NODE_TYPE_NAMES).includes(propertyValue.nodeType)) {
                propertyValueConfig.type = 'reference';
                // propertyValueConfig.propertyValueJSON is created using finalizePropertyValueConfig for this type
            } else {
                throw new Error('Property value is unsupported object type.');
            }
            // TODO Not sure if I want to enable arbitrary JSON yet. It has a lot of cons (won't have object references, edge cases with numberics).
            // Also don't think many custom element properties will have an array data type. If they do TypedArrays may be preferable anyway.
            // It's part of the custom-elements-everywhere suite so may be worth it:
            // https://github.com/webcomponents/custom-elements-everywhere/blob/master/libraries/preact/src/basic-tests.js#L151
            // else {
            //     propertyValueConfig.type = 'json';
            //     propertyValueConfig.propertyValueJSON = JSON.stringify(propertyValue);
            // }
        } else {
            throw new Error('Property value is unsupported primitive type.');
        }
        return propertyValueConfig;
    };

    const isPropertyValueConfigFinalized = function (propertyValueConfig) {
        if (propertyValueConfig.type === 'reference' && propertyValueConfig.propertyValueJSON === '') {
            return false;
        }
        return true;
    };

    const finalizePropertyValueConfig = function (propertyValueConfig, propertyValue) {
        if (propertyValueConfig.type === 'reference') {
            const reference = referenceManager.createReference(propertyValue);
            propertyValueConfig.propertyValueJSON = JSON.stringify({data: reference});
        }
    };

    const createPropertyValueConfigs = function (base, propertyNames) {
        const propertyValueConfigsToFinalize = [];
        const propertyValueConfigs = propertyNames.map(function (propertyName) {
            const propertyNameParts = propertyName.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = propertyNameParts.pop();
            const target = lookupTarget(base, propertyNameParts);
            const propertyValue = target[lastNamePart];
            const propertyValueConfig = createPropertyValueConfig(propertyValue);
            if (isPropertyValueConfigFinalized(propertyValueConfig) === false) {
                propertyValueConfigsToFinalize.push({
                    propertyValueConfig,
                    propertyValue
                });
            }
            return propertyValueConfig;
        });
        propertyValueConfigsToFinalize.forEach(function ({propertyValueConfig, propertyValue}) {
            finalizePropertyValueConfig(propertyValueConfig, propertyValue);
        });
        return propertyValueConfigs;
    };

    const evaluatePropertyValueConfig = function (propertyValueConfig) {
        const {type, propertyValueJSON} = propertyValueConfig;
        const propertyValueParsed = JSON.parse(propertyValueJSON);
        if (type === 'undefined') {
            const propertyValue = undefined;
            return propertyValue;
        } else if (type === 'number' || type === 'string' || type === 'boolean') {
            const propertyValue = propertyValueParsed.data;
            return propertyValue;
        } else if (type === 'reference') {
            const reference = propertyValueParsed.data;
            const propertyValue = referenceManager.getObject(reference);
            return propertyValue;
        }
        // else if (type === 'json') {
        //     const propertyValue = propertyValueParsed;
        //     return propertyValue;
        // }
        throw new Error('Unexpected property value type ${type}');
    };

    // propertyValueConfigsJSON: [{type, propertyValueJSON}]
    const getProperties = function (elementReference, propertyNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const propertyNames = JSON.parse(propertyNamesJSON);
        const propertyValueConfigs = createPropertyValueConfigs(element, propertyNames);
        const propertyValueConfigsJSON = JSON.stringify(propertyValueConfigs);
        return propertyValueConfigsJSON;
    };

    // propertyValueConfigsJSON: [{type, propertyValueJSON}]
    const setProperties = function (elementReference, propertyNamesJSON, propertyValueConfigsJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);

        const propertyNames = JSON.parse(propertyNamesJSON);
        const propertyValueConfigs = JSON.parse(propertyValueConfigsJSON);

        if (propertyNames.length !== propertyValueConfigs.length) {
            throw new Error('Must provide an equal number of property names and property values to set');
        }

        propertyNames.forEach(function (propertyName, index) {
            const propertyNameParts = propertyName.split('.');
            // Mutates array by removing the last name part
            const lastNamePart = propertyNameParts.pop();
            const target = lookupTarget(element, propertyNameParts);
            const propertyValueConfig = propertyValueConfigs[index];
            const propertyValue = evaluatePropertyValueConfig(propertyValueConfig);
            target[lastNamePart] = propertyValue;
        });
    };

    // parametersConfigJSON: [parameterJSON]
    const invokeMethod = async function (elementReference, methodName, propertyValueConfigsJSON) {
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

        const propertyValueConfigs = JSON.parse(propertyValueConfigsJSON);
        const parameters = propertyValueConfigs.map(propertyValueConfig => evaluatePropertyValueConfig(propertyValueConfig));
        const returnValueInitial = await method.apply(context, parameters);
        const returnValue = createPropertyValueConfig(returnValueInitial);
        finalizePropertyValueConfig(returnValue, returnValueInitial);
        const returnValueJSON = JSON.stringify(returnValue);
        return returnValueJSON;
    };

    const classesToAdd = function (elementReference, classNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const classNames = JSON.parse(classNamesJSON);
        element.classList.add.apply(element.classList, classNames);
    };

    const classesToRemove = function (elementReference, classNamesJSON) {
        const element = referenceManager.getObject(elementReference);
        validateDOMObject(element, ELEMENT_NODE);
        const classNames = JSON.parse(classNamesJSON);
        element.classList.add.apply(element.classList, classNames);
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
        constructor (element, eventName, propertyNamesJSON) {
            const propertyNames = JSON.parse(propertyNamesJSON);
            this._element = element;
            this._eventName = eventName;
            this._queue = new DataQueue();
            this._handler = function (event) {
                const propertyValueConfigsJSON = createPropertyValueConfigs(event, propertyNames);
                this._queue.enqueue(propertyValueConfigsJSON);
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
        referenceManager.closeReference(eventManagerReference);
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
        appendChildren,
        createDocumentFragment,
        createElements,
        // removeChild?

        // Configure
        // TODO auto batch sets and gets like a mini fastdom? would be nice to be on raf...
        classesToAdd,
        classesToRemove,
        getAttributes,
        setAttributes,
        getProperties,
        setProperties,

        // Monitor
        addEventListener,
        removeEventListener,
        waitForEvent,

        // Operate
        invokeMethod,

        // Search
        querySelectors,
        querySelectorAll

        // TODO how do we handle close?
        // Should we be somewhat magical? Calling appendChild on a DocumentFragment closes the reference?
        // I don't think element references should be closed automatically if removed from DOM, just document fragments (also because they can't be reused)
        // Should we handle property references seperately? Maybe not.. might want an element reference to a property.
        // Maybe we should only allow property references that are DOM objects? Or should this be a generic JavaScript Reflection api...
    };
}());
