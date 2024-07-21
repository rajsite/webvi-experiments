import { XMLHttpRequest } from 'xhr/mod.ts';
import './Support/node_modules/webvi-websockets/source/main.js';
import vireoHelpers from './Support/node_modules/vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';

async function createInstance (mainUrl: string) {
    const customGlobalWithBuiltins = Object.create(globalThis);
    // TODO Currently the global is mutated to include NationalInstrumentsWebSockets based on the webvi-websockets import style
    // customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(WebSocket);
    const webAppRoot = new URL('./', mainUrl).href;
    customGlobalWithBuiltins.WebVIDenoMeta = {
        getWebAppRoot: () => {
            return webAppRoot;
        }
    }

    // @ts-ignore TODO deno doesn't understand default exports?
    const vireo = await vireoHelpers.createInstance({
        wasmUrl: (new URL('./Support/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.core.wasm', import.meta.url)).href
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

export async function run(mainUrl: string, viaCode: string) {
    if (globalThis.vireoInstance || globalThis.vireoHelpers) {
        throw new Error('Vireo already instantiated globally');
    }
    const vireo = await createInstance(mainUrl);
    vireo.eggShell.loadVia(viaCode);

    // Make vireo instance available to libraries
    globalThis.vireoInstance = vireo;
    globalThis.vireoHelpers = vireoHelpers;
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
}
