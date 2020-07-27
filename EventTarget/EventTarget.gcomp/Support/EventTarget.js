(function () {
    'use strict';

    const getTargetDocument = function () {
        return document;
    };

    const getTargetWindow = function () {
        return window;
    };

    const getTargetSelector = function (selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector (${selector}). Instead found ${elements.length}.`);
        }
        const element = elements[0];
        return element;
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

    const addEventListener = function (target, eventName, preventDefault) {
        // EventTarget apis: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
        if (target instanceof EventTarget === false) {
            throw new Error('Unable to create event listener for target. Target must be instanceof EventTarget.');
        }
        let eventHandler;
        const eventStream = new ReadableStream({
            start (controller) {
                eventHandler = function (event) {
                    if (event instanceof Event === false) {
                        controller.error(new Error(`Unable to handle resulting event. Event ${eventName} did not result in a valid event object.`));
                        return;
                    }

                    if (preventDefault && event.cancelable === false) {
                        controller.error(new Error(`Unable to prevent default for event. Event ${eventName} is not cancelable.`));
                        return;
                    }

                    if (preventDefault) {
                        event.preventDefault();
                    }

                    controller.enqueue(event);
                };
                target.addEventListener(eventName, eventHandler);
            },
            cancel () {
                target.removeEventListener(eventName, eventHandler);
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const removeEventListener = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        await eventStreamReader.cancel();
    };

    // Shared event utilities
    const validateEventName = function (validEventNames, eventName) {
        if (!validEventNames.includes(eventName)) {
            throw new Error(`Expect events are (${validateEventName.join(',')}) instead received (${eventName})`);
        }
    };

    const stringOrDefault = function (value) {
        return typeof value === 'string' ? value : '';
    };

    // KeyboardEvent specific
    const addKeyboardEventListener = function (target, eventName, preventDefault) {
        validateEventName(['keydown', 'keyup'], eventName);
        const eventStreamReader = addEventListener(target, eventName, preventDefault);
        return eventStreamReader;
    };

    const waitForKeyboardEvent = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        const {done, value} = await eventStreamReader.read();
        if (value instanceof KeyboardEvent === false) {
            throw new Error('Unexpected event type occurred. Expected KeyboardEvent.');
        }
        // List of KeyboardEvent properties: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

        // key is the interpretted value of the key pressed on the keyboard including locale, modifiers, etc
        // key values: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
        const key = value ? stringOrDefault(value.key) : '';

        // code is the physical key on the keyboard. US keyboard button names are used as the code.
        // For example, KeyQ represents the same physical key on all keyboards irregardless of language for keyboard / operating system
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
        // Note: Looks like event.code is not supported in CEF (the browser embedded in the editor) and will be empty string:
        // See https://bitbucket.org/chromiumembedded/cef/issues/2597/windows-windowless-keyboard-handling
        const code = value ? stringOrDefault(value.code) : '';

        const result = {key, code, done};
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    window.WebVIEventTarget = {
        // Find Target
        getTargetDocument,
        getTargetWindow,
        getTargetSelector,

        // Keyboard Events
        addKeyboardEventListener,
        waitForKeyboardEvent,

        // Shared
        removeEventListener
    };
}());
