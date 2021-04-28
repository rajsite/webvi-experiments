(function () {
    'use strict';
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

    window.WebVIControlTools = {dataGridSortColumn};
}());
