(function () {
    'use strict';

    // Shared
    const styleCreate = function (...rules) {
        const style = document.createElement('style');
        document.head.insertAdjacentElement('beforeend', style);
        rules.forEach(rule => style.sheet.insertRule(rule));
        return style;
    };

    const styleRemove = function (style) {
        style.parentNode.removeChild(style);
    };

    const uniqueSelectorSymbol = Symbol('Unique selector for element');
    const uniqueSelector = function (element) {
        if (element[uniqueSelectorSymbol]) {
            return element[uniqueSelectorSymbol];
        }
        const value = `_${Math.random().toString(36).substr(2, 9)}`;
        const name = 'webvi-control-extension';
        element.setAttribute(name, value);
        const selector = `[${name}="${value}"]`;
        element[uniqueSelectorSymbol] = selector;
        return selector;
    };

    const findAncestorByTagname = function (element, tagName) {
        let selectedElement;
        for (let currentElement = element; currentElement !== null; currentElement = currentElement.parentElement) {
            if (currentElement.tagName === tagName) {
                selectedElement = currentElement;
                break;
            }
        }
        return selectedElement;
    };

    const validateControl = function (element, tagNames) {
        if (element instanceof HTMLElement === false) {
            throw new Error('Expected reference to be an HTML control');
        }

        if (!tagNames.includes(element.tagName)) {
            throw new Error(`Expected reference to target one of (${tagNames.join(', ')}) but instead found ${element.tagName}`);
        }
    };

    // Button
    const buttonGlyphCreateImageURLStyle = function (element, url) {
        validateControl(element, ['JQX-TOGGLE-BUTTON']);
        const resolvedUrlInstance = new URL(url, window.location.href);
        const resolvedUrl = resolvedUrlInstance.href;
        const elementSelector = uniqueSelector(element);
        const urlEscaped = CSS.escape(resolvedUrl);
        const style = styleCreate(`${elementSelector} .ni-glyph::before {
            content: url("${urlEscaped}");
        }`);
        return style;
    };

    // Data Grid
    const validateDataGridAllowsSorting = function (element) {
        if (element.allowSorting === false) {
            throw new Error('DataGrid must be an indicator and the "Sorted view" option must be enabled in editor under Properties >> Behavior >> Sorted view to programmatically change the sort order.');
        }
    };

    const validateDataGridAllowsGrouping = function (element) {
        if (element.allowGrouping === false) {
            throw new Error('DataGrid must have "Allow grouping" option enabled in editor under Properties >> Behavior >> Allow grouping to programmatically change the grouping configuration.');
        }
    };

    const validateDataGridColumnIndex = function (element, indexString) {
        const datafields = element.jqref.jqxGrid('source')._source.datafields;
        if (!datafields) {
            throw new Error('A value must be set on the Data Grid before manipulating a column.');
        }
        const fieldNames = element.jqref.jqxGrid('source')._source.datafields.map(field => field.name);
        if (fieldNames.includes(indexString) === false) {
            throw new Error(`Data Grid column index ${indexString} is not a valid column index.`);
        }
    };

    const dataGridColumnByIndexSetSorting = function (element, index, sort) {
        validateControl(element, ['NI-DATA-GRID']);
        validateDataGridAllowsSorting(element);
        const indexString = String(index);
        validateDataGridColumnIndex(element, indexString);

        // From: https://www.jqwidgets.com/jquery-widgets-documentation/documentation/jqxgrid/jquery-grid-sorting.htm
        if (sort === 'ascending') {
            element.jqref.jqxGrid('sortby', indexString, 'asc');
        } else if (sort === 'descending') {
            element.jqref.jqxGrid('sortby', indexString, 'desc');
        } else if (sort === 'none') {
            element.jqref.jqxGrid('removesort');
        } else {
            throw new Error(`Unexpected Data Grid sort value ${sort}`);
        }
    };

    const dataGridColumnByIndexSetGrouping = function (element, indexesBuffer) {
        validateControl(element, ['NI-DATA-GRID']);
        validateDataGridAllowsGrouping(element);
        const indexStrings = Array.from(indexesBuffer).map(index => String(index));
        for (const indexString of indexStrings) {
            validateDataGridColumnIndex(element, indexString);
        }

        // From: https://www.jqwidgets.com/jquery-widgets-documentation/documentation/jqxgrid/jquery-grid-grouping.htm
        element.jqref.jqxGrid('groups', indexStrings);
    };

    // Gauge
    const gaugeNeedleSetArrow = function (element, enabled) {
        validateControl(element, ['JQX-GAUGE']);
        if (element.analogDisplayType !== 'needle') {
            throw new Error('Gauge must be configured in editor under properties as Design >> Display Type >> Needle in order to configure the needle to render as an arrow.');
        }
        // From: https://www.htmlelements.com/demos/gauge/custom-needle/
        function computeArrowHeadPoints(radius, distance, angle, base, height) {
            const sin = Math.sin(angle),
                cos = Math.cos(angle),
                hPointX = radius + (distance - height) * sin,
                hPointY = radius + (distance - height) * cos,
                startPointX1 = hPointX + base * cos,
                startPointY1 = hPointY - base * sin,
                startPointX2 = hPointX - base * cos,
                startPointY2 = hPointY + base * sin,
                endPointX = radius + distance * sin,
                endPointY = radius + distance * cos,
        
                points = 'M ' + startPointX1 + ',' + startPointY1 + ' L ' + startPointX2 + ',' + startPointY2 + ' L ' + endPointX + ',' + endPointY + ' Z';
        
            return points;
        }
        
        function computeArrowBodyPoints(radius, angle, width, length) {
            const sin = Math.sin(angle),
                cos = Math.cos(angle),
                endX1 = radius - width * cos + length * sin,
                endY1 = radius + width * sin + length * cos,
                endX2 = radius + width * cos + length * sin,
                endY2 = radius - width * sin + length * cos,
                startX1 = radius + width * cos,
                startY1 = radius - width * sin,
                startX2 = radius - width * cos,
                startY2 = radius + width * sin,
        
                points = 'M ' + startX1 + ',' + startY1 + ' L ' + startX2 + ',' + startY2 + ' L ' + endX1 + ',' + endY1 + ' ' + endX2 + ',' + endY2;
        
            return points;
        }
        
        function customDrawNeedleFunction(element, renderer, radius, angle, distance) {
            const arrowHeadPoints = computeArrowHeadPoints(radius, radius - distance, angle, 10, 20),
                arrowBodyPoints = computeArrowBodyPoints(radius, angle, 5, radius - distance - 19),
        
                arrowHead = renderer.path(arrowHeadPoints, { 'class': 'jqx-needle' }),
                arrowBody = renderer.path(arrowBodyPoints, { 'class': 'jqx-needle' });
        
            // return an array of all custom SVG elements
            return [arrowHead, arrowBody];
        }

        const customNeedle = (...args) => customDrawNeedleFunction(...args);
        
        if (enabled) {
            element.drawNeedle = customNeedle;
        } else {
            element.drawNeedle = null;
        }
    };

    // Listbox
    const listboxItemsEnableTooltipHandler = Symbol('Mouse handler for tooltips if enabled');
    const listboxItemsEnableTooltip = function (element) {
        validateControl(element, ['JQX-LIST-BOX']);
        if (element[listboxItemsEnableTooltipHandler]) {
            return;
        }
        element[listboxItemsEnableTooltipHandler] = event => {
            const listItem = findAncestorByTagname(event.target, 'JQX-LIST-ITEM');
            if (listItem !== undefined) {
                const labelElements = listItem.querySelectorAll('.jqx-content-label');
                if (labelElements.length === 1) {
                    const [labelElement] = labelElements;
                    const title = labelElement.textContent;
                    listItem.title = title;
                }
            }
        };
        element.addEventListener('mouseover', element[listboxItemsEnableTooltipHandler]);
    };

    // Numeric
    const validateNotNumericTextBox = function (element) {
        if (element.tagName === 'JQX-NUMERIC-TEXT-BOX') {
            throw new Error('Numeric Text controls must be manipulated by property nodes instead of by using Control Extensions');
        }
    };

    const numericScaleSetMaximum = function (element, maximum) {
        validateNotNumericTextBox(element);
        validateControl(element, ['JQX-TANK', 'JQX-PROGRESS-BAR', 'JQX-CIRCULAR-PROGRESS-BAR', 'JQX-SLIDER', 'JQX-GAUGE']);
        element.max = maximum;
    };

    const numericScaleSetMinimum = function (element, minimum) {
        validateNotNumericTextBox(element);
        validateControl(element, ['JQX-TANK', 'JQX-PROGRESS-BAR', 'JQX-CIRCULAR-PROGRESS-BAR', 'JQX-SLIDER', 'JQX-GAUGE']);
        element.min = minimum;
    };

    // Tab
    const tabSelectorVisible = function (element, visible) {
        validateControl(element, ['NI-TAB-CONTROL']);
        element.tabSelectorHidden = !visible;
    };

    // Tree
    const treeValidateColumnIndex = function (element, index) {
        const lastIndex = element.columns.length - 1;
        if (index > lastIndex) {
            throw new Error(`Attempted to use column at index ${index} but valid indices are from 0-${lastIndex}`);
        }
    };

    const treeCellsEnableTooltipHandler = Symbol('Mouse handler for tooltips if enabled');
    const treeCellsEnableTooltip = function (element) {
        validateControl(element, ['NI-TREE-GRID']);
        if (element[treeCellsEnableTooltipHandler]) {
            return;
        }
        element[treeCellsEnableTooltipHandler] = event => {
            const gridCell = findAncestorByTagname(event.target, 'JQX-GRID-CELL');
            if (gridCell !== undefined) {
                const labelElements = gridCell.querySelectorAll('.jqx-label');
                if (labelElements.length === 1) {
                    const [labelElement] = labelElements;
                    const title = labelElement.textContent;
                    gridCell.title = title;
                }
            }
        };
        element.addEventListener('mouseover', element[treeCellsEnableTooltipHandler]);
    };

    const treeColumnSetWidth = function (element, index, width) {
        validateControl(element, ['NI-TREE-GRID']);
        treeValidateColumnIndex(element, index);
        element.columns[index].width = width;
    };

    // Obtain JavaScript Reference
    class DataItem {
        constructor (viName, dataItemPath) {
            this._viName = viName;
            this._dataItemPath = dataItemPath;
            this._vireo = undefined;
            this._vireoHelpers = undefined;
            this._valueRef = undefined;
        }

        getValueRef () {
            if (this._valueRef === undefined) {
                // Find web application
                const webAppElements = document.querySelectorAll('ni-web-application');
                if (webAppElements.length !== 1) {
                    throw new Error('Expected a single ni-web-application element in page.');
                }
                const [webAppElement] = webAppElements;

                const isSupported = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
                if (!isSupported) {
                    throw new Error('Not supported in this version of G Web Development Software.');
                }

                // Find vireo instance
                const vireo = webAppElement.vireoInstance;
                const vireoHelpers = webAppElement.vireoHelpers;

                // Read value from dataspace
                const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(this._viName);
                const valueRef = vireo.eggShell.findValueRef(viNameEncoded, this._dataItemPath);
                this._vireo = vireo;
                this._vireoHelpers = vireoHelpers;
                this._valueRef = valueRef;
            }
            return this._valueRef;
        }
    }

    class ReferenceDataItem extends DataItem {
        getValue () {
            const valueRef = this.getValueRef();
            return this._vireo.eggShell.readJavaScriptRefNum(valueRef);
        }
    }

    const obtainJavaScriptReferenceGObjectDataItem = new ReferenceDataItem('ControlExtensions::Support::Obtain JavaScript Reference - GObject.gvi', 'dataItem_Referenceprobe');

    const obtainJavaScriptReferenceGObject = function () {
        const value = obtainJavaScriptReferenceGObjectDataItem.getValue();
        if ((value && value.element instanceof HTMLElement) === false) {
            throw new Error('Expected reference to be an HTML control');
        }
        return value.element;
    };

    window.WebVIControlExtensions = {
        buttonGlyphCreateImageURLStyle,
        dataGridColumnByIndexSetSorting,
        dataGridColumnByIndexSetGrouping,
        gaugeNeedleSetArrow,
        numericScaleSetMaximum,
        numericScaleSetMinimum,
        listboxItemsEnableTooltip,
        styleRemove,
        tabSelectorVisible,
        treeCellsEnableTooltip,
        treeColumnSetWidth,
        obtainJavaScriptReferenceGObject
    };
}());
