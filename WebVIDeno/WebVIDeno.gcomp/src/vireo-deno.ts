
// const webviWebsockets = require('webvi-websockets');
// const w3cwebsocket = require('websocket').w3cwebsocket;
// const xhr2 = require('xhr2');
const vireoHelpers = require('vireo');
const ViaHelpers = require('./ViaHelpers.js');

class VireoNode {
    static async createInstance (customGlobal) {
        const customGlobalWithBuiltins = customGlobal === undefined ? Object.create(global) : Object.create(customGlobal);
        // customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(w3cwebsocket);

        const vireo = await vireoHelpers.createInstance();

        vireo.javaScriptInvoke.registerCustomGlobal(customGlobalWithBuiltins);
        // vireo.httpClient.setXMLHttpRequestImplementation(xhr2);

        const notSupportedError = () => {
            throw new Error('Unsupported on this target');
        };

        const logLabVIEWError = function (_ignoreReturnValueRef, _statusValueRef, codeValueRef, sourceValueRef) {
            const code = vireo.eggShell.readDouble(codeValueRef);
            const source = vireo.eggShell.readString(sourceValueRef);
            throw new Error(`LabVIEW error ${code} occured at ${source === '' ? 'unknown location' : source}`);
        };

        vireo.javaScriptInvoke.registerInternalFunctions({
            ControlReference_GetControlObject: notSupportedError,
            PropertyNode_PropertyRead: notSupportedError,
            PropertyNode_PropertyWrite: notSupportedError,
            OneButtonDialog: notSupportedError,
            TwoButtonDialog: notSupportedError,
            LogLabVIEWError: logLabVIEWError,
            InvokeControlFunction: notSupportedError
        });
        return vireo;
    }

    static get vireoHelpers () {
        return vireoHelpers;
    }

    static createViaHelpers (viaWithEnqueue) {
        return new ViaHelpers(viaWithEnqueue);
    }
}
