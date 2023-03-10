import {XMLHttpRequest} from "../deps/xhr/mod.ts";
import webviWebsockets from "../deps/webvi-websockets/source/main.js";
import vireoHelpers from '../deps/vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';
import { ViaHelpers } from './via-helpers.ts';
import {vireoDataUrl} from '../dist/vireoDataUrl.js';

declare namespace globalThis {
    let NationalInstrumentsWebSockets: unknown;
}

export class VireoDeno {
    static async createInstance (customGlobal?: unknown) {
        const customGlobalWithBuiltins = customGlobal === undefined ? Object.create(globalThis) : Object.create(customGlobal);
        customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(WebSocket);

        const vireo = await vireoHelpers.createInstance({
            wasmUrl: vireoDataUrl
        });

        vireo.javaScriptInvoke.registerCustomGlobal(customGlobalWithBuiltins);
        vireo.httpClient.setXMLHttpRequestImplementation(XMLHttpRequest);

        const notSupportedError = () => {
            throw new Error('Unsupported on this target');
        };

        const logLabVIEWError = function (_ignoreReturnValueRef: unknown, _statusValueRef: unknown, codeValueRef: unknown, sourceValueRef: unknown) {
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

    static createViaHelpers (viaWithEnqueue: string) {
        return new ViaHelpers(viaWithEnqueue);
    }
}
