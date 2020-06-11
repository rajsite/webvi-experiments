(function () {
    'use strict';

    const browser = window.browser || window.chrome;
    const webAppElement = document.querySelector('ni-web-application');
    webAppElement.addEventListener('webvi-debugger-message', function (eventConfig) {
        const inspectPanelResultJSON = eventConfig.detail;
        browser.runtime.sendMessage(inspectPanelResultJSON);
    });
}());
