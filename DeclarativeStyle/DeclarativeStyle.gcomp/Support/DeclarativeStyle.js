(function () {
    'use strict';

    const matchers = {
        'exact match': '=',
        'starts with': '^=',
        'ends with': '$=',
        'contains': '*='
    };

    const getMatcher = function (operator) {
        const matcher = matchers[operator];
        // LabVIEW will clamp matchers so unlikely this case will be hit
        if (matcher === undefined) {
            throw new Error(`Unexpected operator for ${operator}. Supported operators are ${Object.keys(matchers).join(',')}.`);
        }
        return matcher;
    };

    const createAttributeSelector = function (attributeName, operator, text, caseInsensitive) {
        const matcher = getMatcher(operator);
        const caseInsensitiveToken = caseInsensitive ? ' i' : '';
        const attributeSelector = `[${attributeName}${matcher}"${CSS.escape(text)}"${caseInsensitiveToken}]`;
        return attributeSelector;
    };

    const findControl = function (selector, tagName) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected a single element with selector (${selector}) but found: ${elements.length}`);
        }
        const [element] = elements;
        if (element.tagName !== tagName) {
            throw new Error(`Expected selector (${selector}) to target a data grid but instead found ${element.tagName}`);
        }
        return element;
    };

    const dataGridStringColumnTextMatch = function (config) {
        const {selector, index, operator, text} = config;
        const element = findControl(selector, 'NI-DATA-GRID');

        // The attribute named text is always case insensitive: https://html.spec.whatwg.org/multipage/semantics-other.html#case-sensitivity-of-selectors
        // Can support case sensitive matching when selector is available: https://caniuse.com/mdn-css_selectors_attribute_case_sensitive_modifier
        const attributeSelector = createAttributeSelector('text', operator, text, true);

        const niType = JSON.parse(element.niType);
        const fieldLength = niType.subtype.fields.length;
        if (index < 0 || index >= fieldLength) {
            throw new Error(`Expected column index ${index} to be in range [0-${fieldLength - 1}] for data grids with selector ${selector}.`);
        }
        const column = element.querySelectorAll(`ni-data-grid-column[index="${index}"] > ni-string-control`);
        if (column.length !== 1) {
            throw new Error(`String column not found at column index ${index} for data grid with selector ${selector}.`);
        }

        // +1 as NXG is zero-indexed while css nth-child is one-indexed
        // +1 as the first column is for row header (even when not visible)
        const colIndex = index + 2;
        const rule = `${selector} div[role="row"] > div[role="gridcell"]:nth-child(${colIndex}) ni-string-control${attributeSelector}`;
        return rule;
    };

    const types = {
        'datagrid-stringcolumn-textmatch': dataGridStringColumnTextMatch
    };

    const createStyle = function (ruleSelectorJSON, rulePropertiesJSON) {
        const {type, configJSON} = JSON.parse(ruleSelectorJSON);
        const config = JSON.parse(configJSON);
        const selector = types[type](config);
        const ruleProperties = JSON.parse(rulePropertiesJSON);
        const properties = ruleProperties.map(ruleProperty => `${ruleProperty.name}: ${ruleProperty.value};`).join('\n');
        const rule = `${selector} {
            ${properties}
        }`;
        const style = document.createElement('style');
        document.head.insertAdjacentElement('beforeend', style);
        style.sheet.insertRule(rule);
        return style;
    };

    const removeStyle = function (style) {
        style.parentNode.removeChild(style);
    };

    window.WebVIDeclarativeStyle = {createStyle, removeStyle};
}());
