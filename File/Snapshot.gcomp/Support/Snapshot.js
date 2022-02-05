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
        const blob = await window.htmlToImage.toBlob(element, {
            backgroundColor: 'white',

            // Generated image has the correct height and width
            // but position can push it out of rendered viewport.
            // For absolutely positioned controls this will bring
            // them back in the viewport.
            // See: https://github.com/bubkoo/html-to-image/issues/48
            style: {
                position: 'static'
            }
        });
        const file = coerceToFile(blob, fileName, 'image/png');
        return file;
    };

    window.WebVISnapshot = {
        getImage
    };
}());
