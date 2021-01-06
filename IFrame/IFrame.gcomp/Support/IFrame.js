(function () {
    'use strict';
    const createIFrame = function (container, attributesJSON) {
        const iframeElement = document.createElement('iframe');
        const attributes = JSON.parse(attributesJSON);
        attributes.forEach(attribute => iframeElement.setAttribute(attribute.name, attribute.value));
        iframeElement.style.width = '100%';
        iframeElement.style.height = '100%';
        container.appendChild(iframeElement);
        return iframeElement;
    };

    const removeIFrame = function (iframeElement) {
        iframeElement.parentNode.removeChild(iframeElement);
    };

    window.WebVIIFrame = {createIFrame, removeIFrame};
}());
