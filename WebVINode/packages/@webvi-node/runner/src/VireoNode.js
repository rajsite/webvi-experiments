(function () {
    'use strict';

    const webviWebsockets = require('webvi-websockets');
    const w3cwebsocket = require('websocket').w3cwebsocket;
    const xhr2 = require('xhr2');
    const vireoHelpers = require('vireo');
    class VireoNode {
        constructor (viaWithEnqueue, customGlobal) {
            const enqueueRegex = /^enqueue\s*\((\S*)\)$/m;
            const via = viaWithEnqueue.replace(enqueueRegex, '');
            const viName = viaWithEnqueue.match(enqueueRegex)[1];
            const customGlobalWithBuiltins = customGlobal === undefined ? Object.create(global) : Object.create(customGlobal);
            customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(w3cwebsocket);
            this._via = via;
            this._viName = viName;
            this._customGlobal = customGlobalWithBuiltins;
            this._vireoInstance = undefined;
            this._vireoHelpers = vireoHelpers;
        }

        get vireoInstance () {
            return this._vireoInstance;
        }

        get vireoHelpers () {
            return this._vireoHelpers;
        }

        async initialize () {
            const vireo = await vireoHelpers.createInstance();
            vireo.javaScriptInvoke.registerCustomGlobal(this._customGlobal);
            vireo.httpClient.setXMLHttpRequestImplementation(xhr2);

            const notSupportedError = () => {
                throw new Error('Unsupported on this target');
            };

            const logLabVIEWError = function (ignoreReturnValueRef, statusValueRef, codeValueRef, sourceValueRef) {
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
            vireo.eggShell.loadVia(this._via);
            this._vireoInstance = vireo;
            return vireo;
        }

        getVIName () {
            return this._viName;
        }

        enqueueVI () {
            this._vireoInstance.eggShell.loadVia(`enqueue(${this._viName})`);
        }
    }
    module.exports = VireoNode;
}());
