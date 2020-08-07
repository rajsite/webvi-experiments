(function () {
    'use strict';

    const getImmediateValue = function (selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected exactly one element but found ${elements.length} with selector ${selector}.`);
        }
        const [element] = elements;
        if (element.tagName !== 'NI-STRING-CONTROL') {
            throw new Error(`Expected selector ${selector} to target a String Control but instead found ${element.tagName}. Make sure to correctly configure the HTML class attribute of a NXG 5 String Control.`);
        }
        const textareas = element.querySelectorAll('textarea');
        if (textareas.length !== 1) {
            throw new Error(`Unexpected ni-string-control structure. This VI has only been tested with NXG 5.`);
        }
        const [textarea] = textareas;
        return textarea.value;
    };
    window.WebVIStringControlHelpers = {getImmediateValue};
}());
