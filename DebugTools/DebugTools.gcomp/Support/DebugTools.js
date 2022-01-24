(function () {
    'use strict';

    const debugLog = function (prefix) {
        // Find web application
        const webAppElements = document.querySelectorAll('ni-web-application');
        if (webAppElements.length !== 1) {
            console.log('Expected a single ni-web-application element in page for debugging.');
            return;
        }
        const [webAppElement] = webAppElements;

        const isSupported = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
        if (!isSupported) {
            console.log('WebVIDebugger not supported in this version of G Web Development Software.');
            return;
        }

        // Find vireo instance
        const vireo = webAppElement.vireoInstance;
        const vireoHelpers = webAppElement.vireoHelpers;

        // Read value from dataspace
        const viName = 'DebugTools::Debug Log.gvi';
        const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
        const valueRef = vireo.eggShell.findValueRef(viNameEncoded, 'dataItem_Valueprobe');
        const variantValueJSON = vireo.eggShell.readJSON(valueRef);
        const variantValue = JSON.parse(variantValueJSON);
        const variantDataName = '_data';
        const value = variantValue[variantDataName];

        // log value
        const isInBrowser = webAppElement.location === 'BROWSER';
        if (isInBrowser) {
            if (prefix === '') {
                console.log(value);
            } else {
                console.log(prefix, value);
            }
        } else {
            // The editor console output only shows one line of the output
            // so concatenate the message to a single line
            const valueJSON = JSON.stringify(value);
            console.log(`${prefix}${valueJSON}`);
        }
    };

    window.WebVIDebugTools = {debugLog};
}());
