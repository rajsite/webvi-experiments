(function () {
    'use strict';
    const inspectPanelValues = function (callChainJSON) {
        // static references
        const encodeIdentifier = window.vireoHelpers.staticHelpers.encodeIdentifier;
        const jsonic = window.jsonic;

        // instance references
        const vireo = window.NationalInstruments.HtmlVI.webApplicationModelsService.getModel(document.querySelector('ni-web-application')).updateService.vireo;

        // input processing
        const callChain = JSON.parse(callChainJSON);
        const viName = callChain[callChain.length - 1];
        const viNameEncoded = encodeIdentifier(viName);
        const viRef = vireo.eggShell.findValueRef(viNameEncoded, '');

        // read dataspace
        const dataSpaceJSON = vireo.eggShell.readJSON(viRef);
        // Using jsonic instead of JSON.parse because of cases where readJSON results in invalid JSON (may be in future NXG versions): https://github.com/ni/VireoSDK/pull/622
        const dataSpace = jsonic(dataSpaceJSON);
        const dataItemNames = Object.keys(dataSpace).filter(key => key.indexOf('dataItem_') !== -1);
        const dataItems = dataItemNames.reduce(function (obj, dataItemName) {
            obj[dataItemName] = dataSpace[dataItemName];
            return obj;
        }, {});

        console.log(dataItems);
    };

    window.WebVIDebugger = {inspectPanelValues};
}());
