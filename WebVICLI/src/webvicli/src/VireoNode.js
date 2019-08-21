(function () {
    'use strict';

    // Bunch of workarounds to enable client WebSocket api in node.js
    const oldWindow = global.window;
    global.window = {};
    require('webvi-websockets');
    global.NationalInstrumentsWebSockets = global.window.NationalInstrumentsWebSockets;
    global.window = oldWindow;
    const W3CWebSocket = require('websocket').w3cwebsocket;
    class WebSocketShim extends W3CWebSocket {
        get protocol () {
            return this._protocol === undefined ? '' : this._protocol;
        }
    }
    global.WebSocket = WebSocketShim;

    const path = require('path');
    const xhr2 = require('xhr2');

    const webvicliconfig = require('./webvicliconfig.js');
    class VireoNode {
        constructor (viaWithEnqueue) {
            const enqueueRegex = /^enqueue\s*\((\S*)\)$/m;
            const via = viaWithEnqueue.replace(enqueueRegex, '');
            const viName = viaWithEnqueue.match(enqueueRegex)[1];
            this._via = via;
            this._viName = viName;
            this._vireo = undefined;
        }

        get vireo () {
            return this._vireo;
        }

        async initialize () {
            const componentPath = webvicliconfig.getComponentPath();
            const vireoHelpers = require(path.resolve(componentPath, 'ni-webvi-resource-v0/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.min.js'));

            const vireo = await vireoHelpers.createInstance();

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
            this._vireo = vireo;
            return vireo;
        }

        getVIName () {
            return this._viName;
        }

        enqueueVI () {
            this._vireo.eggShell.loadVia(`enqueue(${this._viName})`);
        }
    }
    module.exports = VireoNode;
}());
