(function () {
    'use strict';

    const probeValue = function (name, callChainJSON) {
        // static references
        const webAppElement = document.querySelector('ni-web-application');

        const isNXG5 = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
        if (!isNXG5) {
            console.log('WebVIDebugger not supported in this version of NXG.');
            return;
        }

        // Find vireo instance
        const vireo = webAppElement.vireoInstance;

        // Find vireoHelpers
        const vireoHelpers = webAppElement.vireoHelpers;

        // input processing
        const callChain = JSON.parse(callChainJSON);

        // The zeroth item in the call chain is Probe.gvi
        const viName = callChain[0];
        const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
        const valueRef = vireo.eggShell.findValueRef(viNameEncoded, 'dataItem_Probeout');

        // read dataspace
        const probeJSON = vireo.eggShell.readJSON(valueRef);
        const probe = JSON.parse(probeJSON);
        const inspectPanelResult = {
            [name]: probe
        };
        console.log(inspectPanelResult);
        const inspectPanelResultJSON = JSON.stringify(inspectPanelResult);
        const eventConfig = {
            detail: inspectPanelResultJSON
        };
        const event = new CustomEvent('webvi-debugger-message', eventConfig);
        webAppElement.dispatchEvent(event);
    };

    window.WebVIDebugger = {probeValue};
}());
