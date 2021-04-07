(function () {
    'use strict';

    const validateSelectElement = function (element) {
        if (element instanceof HTMLSelectElement === false) {
            throw new Error('Input is not a valid HTMLSelectElement');
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

    const createOptionsFragment = function (options) {
        const fragment = new DocumentFragment();
        options.forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.textContent = option;
            optionElement.value = index;
            fragment.appendChild(optionElement);
        });
        return fragment;
    };

    const setSelectOptions = function (selectElement, options) {
        const optionsFragment = createOptionsFragment(options);
        selectElement.innerHTML = '';
        selectElement.appendChild(optionsFragment);
    };

    const getSelectedIndexes = function (selectElement) {
        const selectedOptions = Array.from(selectElement.selectedOptions);
        const selectedIndexes = selectedOptions.map(selectedOption => Number(selectedOption.value));
        return selectedIndexes;
    };

    // Exported functions

    const createElement = function (placeholder, optionsJSON) {
        const options = JSON.parse(optionsJSON);
        const selectElement = document.createElement('select');
        selectElement.classList.add('webvi-select-element');
        selectElement.multiple = true;
        setSelectOptions(selectElement, options);
        placeholder.appendChild(selectElement);
        return selectElement;
    };

    const getValue = function (selectElement) {
        validateSelectElement(selectElement);
        const selectedIndexes = getSelectedIndexes(selectElement);
        const value = new Int32Array(selectedIndexes);
        return value;
    };

    const setValue = function (selectElement, value) {
        validateSelectElement(selectElement);
        const selectedIndexes = Array.from(value);

        // Validate selected indexes exist
        const optionElements = selectElement.querySelectorAll('option');
        selectedIndexes.forEach(selectedIndex => {
            if (selectedIndex < 0 || selectedIndex >= optionElements.length) {
                throw new Error(`Selected index is out of range, index: ${selectedIndex}, number of options: ${optionElements.length}`);
            }
            if (Number(optionElements[selectedIndex].value) !== selectedIndex) {
                throw new Error(`Internal Error: select options DOM order (index: ${selectedIndex}) does not match option value attribute ${optionElements[selectedIndex].value}`);
            }
        });

        // Deselect current options and enable new selection
        const selectedOptions = Array.from(selectElement.selectedOptions);
        selectedOptions.forEach(selectedOption => {
            selectedOption.selected = false;
        });
        selectedIndexes.forEach(selectedIndex => {
            optionElements[selectedIndex].selected = true;
        });
    };

    const getOptions = function (selectElement) {
        validateSelectElement(selectElement);
        const optionElements = Array.from(selectElement.options);
        const options = optionElements.map(optionElement => optionElement.textContent);
        const resultJSON = JSON.stringify(options);
        return resultJSON;
    };

    const setOptions = function (selectElement, optionsJSON) {
        validateSelectElement(selectElement);
        const options = JSON.parse(optionsJSON);
        setSelectOptions(selectElement, options);
    };

    const addEventListener = function (selectElement, name) {
        validateSelectElement(selectElement);
        validateEventName(name);
        let changeHandler;
        const eventStream = new ReadableStream({
            start (controller) {
                changeHandler = () => {
                    const value = getSelectedIndexes(selectElement);
                    controller.enqueue(value);
                };
                selectElement.addEventListener(name, changeHandler);
            },
            cancel () {
                selectElement.removeEventListener(name, changeHandler);
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const waitForEvent = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        const {value, done} = await eventStreamReader.read();
        const result = {
            value: done ? [] : value,
            done
        };
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    const removeEventListener = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        await eventStreamReader.cancel();
    };

    window.WebVISelectElement = {
        createElement,
        getValue,
        setValue,
        getOptions,
        setOptions,
        addEventListener,
        waitForEvent,
        removeEventListener
    };
}());
