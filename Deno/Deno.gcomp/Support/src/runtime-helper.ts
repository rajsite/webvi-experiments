import { XMLHttpRequest } from 'xhr/mod.ts';
import webviWebsockets from 'webvi-websockets/source/main.js';
import vireoHelpers from 'vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';

async function createInstance () {
    const customGlobalWithBuiltins = Object.create(globalThis);
    customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(WebSocket);

    const vireo = await vireoHelpers.createInstance({
        wasmUrl: (new URL('../../../ni-webvi-resource-v0/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.core.wasm', import.meta.url)).href
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

declare namespace globalThis {
    let vireoInstance: unknown;
    let vireoHelpers: unknown;
}

export async function run(viaCode: string) {
    if (globalThis.vireoInstance || globalThis.vireoHelpers) {
        throw new Error('Vireo already instantiated globally');
    }
    const vireo = await createInstance();
    vireo.eggShell.loadVia(viaCode);

    // Make vireo instance available to libraries
    globalThis.vireoInstance = vireo;
    globalThis.vireoHelpers = vireoHelpers;
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
}
