
(function () {
    'use strict';
    const browser = window.browser || window.chrome;
    browser.devtools.panels.create(
        'WebVI',
        '/Support/star.png',
        '/webvi-devtools-panel.html'
    );
}());


