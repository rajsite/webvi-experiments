(function () {
    'use strict';

    const obtainJavaScriptReferenceGObject = function () {
        // Find web application
        const webAppElements = document.querySelectorAll('ni-web-application');
        if (webAppElements.length !== 1) {
            throw new Error('Expected a single ni-web-application element in page.');
        }
        const [webAppElement] = webAppElements;

        const isSupported = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
        if (!isSupported) {
            throw new Error('ControlExtensions not supported in this version of G Web Development Software.');
        }

        // Find vireo instance
        const vireo = webAppElement.vireoInstance;
        const vireoHelpers = webAppElement.vireoHelpers;

        // Read value from dataspace
        const viName = 'ControlExtensions::Support::Obtain JavaScript Reference - GObject.gvi';
        const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
        const valueRef = vireo.eggShell.findValueRef(viNameEncoded, 'dataItem_Referenceprobe');
        const value = vireo.eggShell.readJavaScriptRefNum(valueRef);
        if ((value && value.element instanceof HTMLElement) === false) {
            throw new Error('Expected reference to be an HTML control');
        }
        return value.element;
    };

    const validateControl = function (element, tagName) {
        if (element instanceof HTMLElement === false) {
            throw new Error('Expected reference to be an HTML control');
        }

        if (element.tagName !== tagName) {
            throw new Error(`Expected reference to target a ${tagName} but instead found ${element.tagName}`);
        }
    };

    const tabSelectorVisible = function (element, visible) {
        validateControl(element, 'NI-TAB-CONTROL');
        element.tabSelectorHidden = !visible;
    };

    window.WebVIControlExtensions = {
        obtainJavaScriptReferenceGObject,
        tabSelectorVisible
    };
}());
