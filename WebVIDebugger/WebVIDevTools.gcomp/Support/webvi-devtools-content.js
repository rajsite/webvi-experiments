(function () {
    'use strict';

    const browser = window.browser || window.chrome;

    const isFromPage = function (evt) {
        return evt.source === window;
    };

    const isValidMessageType = function (evt) {
        return typeof evt.data === 'string';
    };

    window.addEventListener('message', function (evt) {
        if (isFromPage(evt) === false || isValidMessageType(evt) === false) {
            return;
        }

        browser.runtime.sendMessage(evt.data);
    });
}());
