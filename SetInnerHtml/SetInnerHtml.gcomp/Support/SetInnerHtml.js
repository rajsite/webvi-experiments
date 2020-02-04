(function () {
    'use strict';
    const setInnerHtml = function (selector, html) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, instead found ${elements.length}`);
        }
        const element = elements[0];
        element.innerHTML = html;
    };

    window.WebVISetInnerHtml = {setInnerHtml};
}());
