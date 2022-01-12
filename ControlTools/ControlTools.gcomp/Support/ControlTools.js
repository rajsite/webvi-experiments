(function () {
    'use strict';
    const findControl = function (selector, tagName) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected a single element with selector (${selector}) but found: ${elements.length}`);
        }
        const [element] = elements;
        if (element.tagName !== tagName) {
            throw new Error(`Expected selector (${selector}) to target a ${tagName} but instead found ${element.tagName}`);
        }
        return element;
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

    const validateAllowsSorting = function (element) {
        if (element.allowSorting === false) {
            throw new Error('DataGrid Sorted View option must be enabled in NXG to programmatically change the sort order');
        }
    };

    const validateColumn = function (element, index) {
        const fieldNames = element.jqref.jqxGrid('source')._source.datafields.map(field => field.name);
        if (fieldNames.includes(index) === false) {
            throw new Error(`Expected column index ${index} not one of ${fieldNames.join(',')} for data grid.`);
        }
    };

    const dataGridSortColumn = function (selector, indexNum, sort) {
        const element = findControl(selector, 'NI-DATA-GRID');
        validateAllowsSorting(element);
        const index = String(indexNum);
        validateColumn(element, index);

        // From: https://www.jqwidgets.com/jquery-widgets-documentation/documentation/jqxgrid/jquery-grid-sorting.htm
        if (sort === 'ascending') {
            element.jqref.jqxGrid('sortby', index, 'asc');
        } else if (sort === 'descending') {
            element.jqref.jqxGrid('sortby', index, 'desc');
        } else if (sort === 'none') {
            element.jqref.jqxGrid('removesort');
        } else {
            throw new Error(`Unexpected sort value ${sort}`);
        }
    };

    const listboxItemTooltip = function (selector) {
        const element = findControl(selector, 'JQX-LIST-BOX');
        element.addEventListener('mouseover', event => {
            const listItem = findAncestorByTagname(event.target, 'JQX-LIST-ITEM');
            if (listItem !== undefined) {
                const labelElements = listItem.querySelectorAll('.jqx-content-label');
                if (labelElements.length === 1) {
                    const [labelElement] = labelElements;
                    const title = labelElement.textContent;
                    listItem.title = title;
                }
            }
        });
    };

    const treeGridCellTooltip = function (selector) {
        const element = findControl(selector, 'NI-TREE-GRID');
        element.addEventListener('mouseover', event => {
            const gridCell = findAncestorByTagname(event.target, 'JQX-GRID-CELL');
            if (gridCell !== undefined) {
                const labelElements = gridCell.querySelectorAll('.jqx-label');
                if (labelElements.length === 1) {
                    const [labelElement] = labelElements;
                    const title = labelElement.textContent;
                    gridCell.title = title;
                }
            }
        });
    };

    const treeColumnWidth = function (selector, index, width) {
        const element = findControl(selector, 'NI-TREE-GRID');
        const lastIndex = element.columns.length - 1;
        if (index > lastIndex) {
            throw new Error(`Attempted to set width of column at index ${index} but valid indexes are from 0-${lastIndex}`);
        }
        element.columns[index].width = width;
    };

    const tabSelectorVisible = function (selector, visible) {
        const element = findControl(selector, 'NI-TAB-CONTROL');
        element.tabSelectorHidden = !visible;
    };

    window.WebVIControlTools = {dataGridSortColumn, listboxItemTooltip, treeGridCellTooltip, treeColumnWidth, tabSelectorVisible};
}());
