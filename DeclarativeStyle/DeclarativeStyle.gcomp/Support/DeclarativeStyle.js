(function () {
    'use strict';
    const dataGridStringColumnValueBasedBackgroundColor = async function (selector, index, text, color) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected a single element with selector (${selector}) but found: ${elements.length}`);
        }
        const [element] = elements;
        if (element.tagName !== 'NI-DATA-GRID') {
            throw new Error(`Expected selector (${selector}) to target a data grid but instead found ${element.tagName}`);
        }
        const niType = JSON.parse(element.niType);
        const fieldLength = niType.subtype.fields.length;
        if (index < 0 || index >= fieldLength) {
            throw new Error(`Expected column index to be in range [0-${fieldLength})`);
        }
        // NXG columns are zero-indexed, css nth-child is one-indexed, the first column is for row header (even when not visible)
        const colIndex = index + 2;
        const rule = `${selector} div[role="row"] > div[role="gridcell"]:nth-child(${colIndex}) ni-string-control[text="${text}"] {
            background-color: ${color};
        }`;
        window.myrule = rule;
        const style = document.createElement('style');
        document.head.insertAdjacentElement('beforeend', style);
        style.sheet.insertRule(rule);
        return style;
    };

    const removeStyle = function (style) {
        style.parentNode.removeChild(style);
    };

    window.WebVIDeclarativeStyle = {dataGridStringColumnValueBasedBackgroundColor, removeStyle};
}());
