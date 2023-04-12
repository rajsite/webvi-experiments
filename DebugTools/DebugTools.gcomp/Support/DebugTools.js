(function () {
    'use strict';

    class CurrentVireoInstance {
        static get () {
            if (!this.vireo) {
                if (window.document) {
                    // Find web application
                    const webAppElements = document.querySelectorAll('ni-web-application');
                    if (webAppElements.length !== 1) {
                        console.log('Expected a single ni-web-application element in page for debugging.');
                    }
                    const [webAppElement] = webAppElements;

                    const isSupported = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
                    if (!isSupported) {
                        console.log('WebVIDebugger not supported in this version of G Web Development Software.');
                    }

                    // Find vireo instance
                    this.vireo = webAppElement.vireoInstance;
                    this.vireoHelpers = webAppElement.vireoHelpers;
                    this.isInBrowser = webAppElement.location === 'BROWSER';
                } else if (window.vireoInstance) {
                    this.vireo = window.vireoInstance;
                    this.vireoHelpers = window.vireoHelpers;
                    this.isInBrowser = false;
                }
            }
            return {
                vireo: this.vireo,
                vireoHelpers: this.vireoHelpers,
                isInBrowser: this.isInBrowser
            };
        }
    }

    const debugLog = function (prefix) {
        const {vireo, vireoHelpers, isInBrowser} = CurrentVireoInstance.get();

        // Read value from dataspace
        const viName = 'DebugTools::Debug Log.gvi';
        const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
        const valueRef = vireo.eggShell.findValueRef(viNameEncoded, 'dataItem_Valueprobe');
        const variantValueJSON = vireo.eggShell.readJSON(valueRef);
        const variantValue = JSON.parse(variantValueJSON);
        const variantDataName = '_data';
        const value = variantValue[variantDataName];

        // log value
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
