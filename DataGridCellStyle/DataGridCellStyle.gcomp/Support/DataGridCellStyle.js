(function () {
    'use strict';
    const createStyle = function (selector, index, text, color) {
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

    window.WebVIDataGridCellStyle = {createStyle, removeStyle};
}());
