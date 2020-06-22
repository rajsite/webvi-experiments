(function () {
    'use strict';

    const validateInputElement = function (element) {
        if (element instanceof HTMLInputElement === false) {
            throw new Error('Input is not a valid HTMLInputElement');
        }
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

    const validateEventName = function (name) {
        const supportedEvents = ['change', 'input'];
        if (supportedEvents.includes(name) === false) {
            throw new Error(`Expected one of the following event types: ${supportedEvents.join(' ')} but received ${name}`);
        }
    };

    const createElement = function (placeholder, attributesJSON) {
        const attributes = JSON.parse(attributesJSON);
        const inputElement = document.createElement('input');
        attributes.forEach(({name, value}) => inputElement.setAttribute(name, value));
        placeholder.appendChild(inputElement);
        return inputElement;
    };

    const getValue = function (inputElement) {
        validateInputElement(inputElement);
        const value = inputElement.value;
        return value;
    };

    const setValue = function (inputElement, value) {
        validateInputElement(inputElement);
        inputElement.value = value;
    };

    const getAttribute = function (inputElement, name) {
        validateInputElement(inputElement);
        const value = inputElement.getAttribute(name);
        const exists = value !== null;
        const result = {
            value: exists ? value : '',
            exists
        };
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    const setAttribute = function (inputElement, name, value, remove) {
        validateInputElement(inputElement);
        if (remove) {
            inputElement.removeAttribute(name);
        } else {
            inputElement.setAttribute(name, value);
        }
    };

    const addEventListener = function (inputElement, name) {
        validateInputElement(inputElement);
        validateEventName(name);
        let changeHandler;
        const eventStream = new ReadableStream({
            start (controller) {
                changeHandler = () => {
                    controller.enqueue(inputElement.value);
                };
                inputElement.addEventListener(name, changeHandler);
            },
            cancel () {
                inputElement.removeEventListener(name, changeHandler);
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const waitForEvent = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        const {value, done} = await eventStreamReader.read();
        const result = {
            value: done ? '' : value,
            done
        };
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    const removeEventListener = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        await eventStreamReader.cancel();
    };

    window.WebVIInputElement = {
        createElement,
        getValue,
        setValue,
        getAttribute,
        setAttribute,
        addEventListener,
        waitForEvent,
        removeEventListener
    };
}());
