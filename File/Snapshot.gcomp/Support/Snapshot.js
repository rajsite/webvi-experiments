(function () {
    'use strict';

    const findElement = function (selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected a single element with selector (${selector}) but found: ${elements.length}`);
        }
        const [element] = elements;
        return element;
    };

    const coerceToFile = function (fileOrBlob, name, type) {
        // Preserve File for metadata (lastModified, contentType, etc.)
        if (fileOrBlob instanceof File) {
            return fileOrBlob;
        }
        const file = new File([fileOrBlob], name, {type});
        return file;
    };

    const getImage = async function (selector, fileName) {
        const element = findElement(selector);
        // For some reason passing a direct reference to the selected element creates a weird offset
        // in the resulting image.
        // Workaround passes the direct child of ni controls instead.
        const niControlId = element.niControlId;
        const workaroundElement = (typeof niControlId === 'string' && niControlId !== '') ? element.firstElementChild : element;
        const blob = await window.htmlToImage.toBlob(workaroundElement, {backgroundColor: 'white'});
        const file = coerceToFile(blob, fileName, 'image/png');
        return file;
    };

    window.WebVISnapshot = {
        getImage
    };
}());
