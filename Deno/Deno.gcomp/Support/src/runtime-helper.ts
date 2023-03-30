import { XMLHttpRequest } from 'xhr/mod.ts';
import webviWebsockets from 'webvi-websockets/source/main.js';
import vireoHelpers from 'vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';
import wasmUrl from 'vireo-core-wasm-esm/release/index.js?bundle';

async function createInstance () {
    const customGlobalWithBuiltins = Object.create(globalThis);
    customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(WebSocket);

    const vireo = await vireoHelpers.createInstance({
        wasmUrl
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

export async function run(viaCode: string) {
    const vireo = await createInstance();
    vireo.eggShell.loadVia(viaCode);
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
}
