(function () {
    'use strict';

    const createMustache = function (placeholder) {
        const container = document.createElement('div');
        container.style.height = '100%';
        container.style.width = '100%';
        container.style.overflow = 'auto';
        const shadow = container.attachShadow({mode: 'open'});
        placeholder.innerHTML = '';
        placeholder.appendChild(container);
        const mustacheReference = {
            placeholder,
            shadow
        };
        return mustacheReference;
    };

    const renderMustache = function (mustacheReference, template, dataJSON) {
        const {shadow} = mustacheReference;
        const data = JSON.parse(dataJSON);
        const html = window.Mustache.render(template, data);
        shadow.innerHTML = html;
    };

    const destroyMustache = function (mustacheReference) {
        const {placeholder} = mustacheReference;
        placeholder.innerHTML = '';
    };

    window.WebVIMustache = {
        createMustache,
        destroyMustache,
        renderMustache
    };
}());
