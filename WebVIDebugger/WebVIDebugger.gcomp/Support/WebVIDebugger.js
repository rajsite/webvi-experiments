(function () {
    'use strict';

    const inspectPanelValues = function (callChainJSON) {
        // static references
        const webAppElement = document.querySelector('ni-web-application');

        const isNXG5 = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
        if (!isNXG5) {
            console.log('WebVIDebugger not supported in this version of NXG. Only');
            return;
        }

        // Find vireo instance
        const vireo = webAppElement.vireoInstance;

        // Find vireoHelpers
        const vireoHelpers = webAppElement.vireoHelpers;

        // input processing
        const callChain = JSON.parse(callChainJSON);

        // Skip the zeroth item in the call chain as it is the Inspect Panel Values VI
        const viName = callChain[1];
        const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
        const viRef = vireo.eggShell.findValueRef(viNameEncoded, '');

        // read dataspace
        const dataSpaceJSON = vireo.eggShell.readJSON(viRef);
        const dataSpace = JSON.parse(dataSpaceJSON);
        const dataItemNames = Object.keys(dataSpace).filter(key => key.indexOf('dataItem_') !== -1);
        const dataItems = dataItemNames.reduce(function (obj, dataItemName) {
            obj[dataItemName] = dataSpace[dataItemName];
            return obj;
        }, {});

        const eventData = JSON.stringify(dataItems);
        console.log(eventData);
        const event = new CustomEvent('webvi-debugger-message', {detail: eventData});
        webAppElement.dispatchEvent(event);
    };

    window.WebVIDebugger = {inspectPanelValues};
}());
