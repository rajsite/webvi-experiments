(function () {
    'use strict';
    const browser = window.browser || window.chrome;
    // Because of activeTab cannot use declarative content scripts?
    // https://groups.google.com/a/chromium.org/d/msg/chromium-extensions/X9he79boSug/SlewctOEBAAJ
    browser.browserAction.onClicked.addListener(() => {
        browser.tabs.executeScript({
            // Use url relative to extension root https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript
            file: '/Support/webvi-devtools-content.js'
        });
    });
}());
