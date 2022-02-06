(function () {
    'use strict';

    class DataItem {
        constructor (viName, dataItemPath) {
            this._viName = viName;
            this._dataItemPath = dataItemPath;
            this._vireo = undefined;
            this._vireoHelpers = undefined;
            this._valueRef = undefined;
        }

        getValueRef () {
            if (this._valueRef === undefined) {
                // Find web application
                const webAppElements = document.querySelectorAll('ni-web-application');
                if (webAppElements.length !== 1) {
                    throw new Error('Expected a single ni-web-application element in page.');
                }
                const [webAppElement] = webAppElements;

                const isSupported = webAppElement && webAppElement.vireoInstance && webAppElement.vireoHelpers;
                if (!isSupported) {
                    throw new Error('Not supported in this version of G Web Development Software.');
                }

                // Find vireo instance
                const vireo = webAppElement.vireoInstance;
                const vireoHelpers = webAppElement.vireoHelpers;

                // Read value from dataspace
                const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(this._viName);
                const valueRef = vireo.eggShell.findValueRef(viNameEncoded, this._dataItemPath);
                this._vireo = vireo;
                this._vireoHelpers = vireoHelpers;
                this._valueRef = valueRef;
            }
            return this._valueRef;
        }
    }

    class ReferenceDataItem extends DataItem {
        getValue () {
            const valueRef = this.getValueRef();
            return this._vireo.eggShell.readJavaScriptRefNum(valueRef);
        }
    }

    const obtainJavaScriptReferenceGObjectDataItem = new ReferenceDataItem('ControlExtensions::Support::Obtain JavaScript Reference - GObject.gvi', 'dataItem_Referenceprobe');

    const obtainJavaScriptReferenceGObject = function () {
        const value = obtainJavaScriptReferenceGObjectDataItem.getValue();
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
