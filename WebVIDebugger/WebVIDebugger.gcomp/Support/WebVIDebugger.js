(function () {
    'use strict';

    const getReferences = function () {
        const webAppElement = document.querySelector('ni-web-application');

        // nxg 3.1
        if (window.vireoHelpers !== undefined) {
            // Find vireo instance
            const webApplicationModelsService = window.NationalInstruments.HtmlVI.webApplicationModelsService;
            const webAppModel = webApplicationModelsService.getModel(webAppElement);
            const updateService = webAppModel.updateService;
            const vireo = updateService.vireo;

            // Find vireoHelpers
            const vireoHelpers = window.vireoHelpers;

            return {
                vireoHelpers,
                vireo
            };
        }

        // nxg 5? (tentative prototype, nxg 5 support not guaranteed, not in beta)
        // Note: In nxg 4 we switched to es6 modules and these internals are no longer exposed in the global scope (good thing),
        // but in order for the debug tools to be possible we might need to expose some properties (like vireoInstance and vireoHelpers below)
        if (webAppElement.vireoInstance !== undefined) {
            // Find vireo instance
            const vireo = webAppElement.vireoInstance;

            // Find vireoHelpers
            const vireoHelpers = webAppElement.vireoHelpers;

            return {
                vireoHelpers,
                vireo
            };
        }

        // nxg 4 may be SOL, couldn't find any good ways to access internal state :(
        return {
            vireoHelpers: undefined,
            vireo: undefined
        };
    };

    let pendingUpdate;
    const inspectPanelValues = function (callChainJSON) {
        if (pendingUpdate !== undefined) {
            return;
        }
        // static references
        const {vireoHelpers, vireo} = getReferences();
        if (vireoHelpers === undefined || vireo === undefined) {
            console.log('WebVIDebugger not supported in this version of NXG. Only');
        }
        const jsonic = window.jsonic;

        // input processing
        const callChain = JSON.parse(callChainJSON);
        // Skip the zeroth item in the call chain as it is the Inspect Panel Values VI
        const viName = callChain[1];
        const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
        const viRef = vireo.eggShell.findValueRef(viNameEncoded, '');

        // read dataspace
        const dataSpaceJSON = vireo.eggShell.readJSON(viRef);
        // Using jsonic instead of JSON.parse because of cases where readJSON results in invalid JSON (should be in final NXG 5): https://github.com/ni/VireoSDK/pull/622
        const dataSpace = jsonic(dataSpaceJSON);
        const dataItemNames = Object.keys(dataSpace).filter(key => key.indexOf('dataItem_') !== -1);
        const dataItems = dataItemNames.reduce(function (obj, dataItemName) {
            obj[dataItemName] = dataSpace[dataItemName];
            return obj;
        }, {});

        const eventData = JSON.stringify(dataItems);
        console.log(eventData);
        pendingUpdate = requestAnimationFrame(() => {
            window.postMessage(eventData, '*');
            pendingUpdate = undefined;
        });
    };

    window.WebVIDebugger = {inspectPanelValues};
}());
