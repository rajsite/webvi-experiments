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

        dequeueAsync () {
            return new Promise((resolve, reject) => {
                if (this.queue === undefined) {
                    throw new Error('The queue has already been destroyed, cannot dequeue any data.');
                }

                if (this.pendingResolve !== undefined) {
                    throw new Error('A pending dequeue operation already exists. Only one pending dequeue operation allowed at a time.');
                }

                if (this.queue.length === 0) {
                    this.pendingResolve = resolve;
                    this.pendingReject = reject;
                } else {
                    const data = this.queue.shift();
                    resolve(data);
                }
            });
        }

        destroy () {
            if (this.pendingResolve !== undefined) {
                this.pendingReject(new Error('Pending dequeue operation failed due to queue destruction.'));
            }
            this.pendingResolve = undefined;
            this.pendingReject = undefined;

            const remaining = this.queue;
            this.queue = undefined;
            return remaining;
        }
    }

    class EventManager {
        constructor (target, eventName, preventDefault) {
            // EventTarget apis: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
            if (target instanceof EventTarget === false) {
                throw new Error('Unable to create EventManager for target.');
            }
            this._target = target;
            this._eventName = eventName;
            this._queue = new DataQueue();
            this._handler = (event) => {
                this._queue.enqueue(new Promise((resolve) => {
                    // Event apis: https://developer.mozilla.org/en-US/docs/Web/API/Event
                    if (event instanceof Event) {
                        if (preventDefault) {
                            if (event.cancelable) {
                                event.preventDefault();
                            } else {
                                throw new Error(`Unable to prevent default for event. Event ${eventName} is not cancelable.`);
                            }
                        }
                    } else {
                        throw new Error(`Unable to handle resulting event. Event ${eventName} did not result in a valid event object.`);
                    }
                    resolve(event);
                }));
            };
            this._target.addEventListener(this._eventName, this._handler);
        }

        async readAsync () {
            const event = await this._queue.dequeueAsync();
            return event;
        }

        stop () {
            this._target.removeEventListener(this._eventName, this._handler);
            this._handler = undefined;
            this._queue.destroy();
            this._queue = undefined;
            this._eventName = undefined;
            this._target = undefined;
        }
    }

    const addEventListener = function (target, eventName, preventDefault) {
        const eventManager = new EventManager(target, eventName, preventDefault);
        const eventManagerReference = referenceManager.createReference(eventManager);
        return eventManagerReference;
    };

    const removeEventListener = function (eventManagerReference) {
        const eventManager = referenceManager.getObject(eventManagerReference);
        if (eventManager === undefined) {
            return;
        }
        referenceManager.closeReference(eventManagerReference);
        eventManager.stop();
    };

    const waitForEvent = async function (eventManagerReference) {
        const eventManager = referenceManager.getObject(eventManagerReference);
        if (eventManager instanceof EventManager === false) {
            throw new Error('Expected to receive an EventManager');
        }
        const event = await eventManager.readAsync();
        return event;
    };

    // Shared event utilities
    const getTarget = function (targetType, targetSelector) {
        if (targetType === 'window') {
            return window;
        } else if (targetType === 'document') {
            return document;
        } else if (targetType === 'element') {
            const elements = document.querySelectorAll(targetSelector);
            if (elements.length !== 1) {
                throw new Error(`Expected to find one element with selector (${targetSelector}). Instead found ${elements.length}.`);
            }
            return elements[0];
        }
        throw new Error(`Unexpected target type (${targetType}).`);
    };

    const validateEventName = function (validEventNames, eventName) {
        if (!validEventNames.includes(eventName)) {
            throw new Error(`Expect events are (${validateEventName.join(',')}) instead received (${eventName})`);
        }
    };

    const stringOrDefault = function (value) {
        return typeof value === 'string' ? value : '';
    };

    // Specific event code: KeyboardEvent
    const addKeyboardEventListener = function (targetType, targetSelector, eventName, preventDefault) {
        const target = getTarget(targetType, targetSelector);
        const keyboardEventNames = ['keydown', 'keyup'];
        validateEventName(keyboardEventNames, eventName);
        const eventManagerReference = addEventListener(target, eventName, preventDefault);
        return eventManagerReference;
    };

    const waitForKeyboardEvent = async function (eventManagerReference) {
        const event = await waitForEvent(eventManagerReference);
        if (event instanceof KeyboardEvent === false) {
            throw new Error('Unexpected event type occurred. Expected KeyboardEvent.');
        }
        // List of KeyboardEvent properties: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
        const eventData = {
            // key is the interpretted value of the key pressed on the keyboard including locale, modifiers, etc
            // key values: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
            key: stringOrDefault(event.key),
            // code is the physical key on the keyboard. US keyboard button names are used as the code.
            // For example, KeyQ represents the same physical key on all keyboards irregardless of language for keyboard / operating system
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
            // Note: Looks like event.code is not supported in CEF (the browser embedded in the editor) and will be empty string:
            // See https://bitbucket.org/chromiumembedded/cef/issues/2597/windows-windowless-keyboard-handling
            code: stringOrDefault(event.code)
        };
        const eventDataJSON = JSON.stringify(eventData);
        return eventDataJSON;
    };

    window.WebVIEventTarget = {
        // Keyboard Events
        addKeyboardEventListener,
        waitForKeyboardEvent,

        // Shared
        removeEventListener
    };
}());
