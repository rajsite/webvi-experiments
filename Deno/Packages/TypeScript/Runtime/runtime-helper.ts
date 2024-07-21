import { XMLHttpRequest } from '@kitsonk/xhr';
import './Support/node_modules/webvi-websockets/source/main.js';
import vireoHelpers from './Support/node_modules/vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';
import { vireoDataUrl } from "./Support/vireo-data-url.js";

async function createInstance () {
    const customGlobalWithBuiltins = Object.create(globalThis);
    // TODO Currently the global is mutated to include NationalInstrumentsWebSockets based on the webvi-websockets import style
    // customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(WebSocket);

    // @ts-ignore TODO deno doesn't understand default exports?
    const vireo = await vireoHelpers.createInstance({
        wasmUrl: vireoDataUrl
    });

    vireo.javaScriptInvoke.registerCustomGlobal(customGlobalWithBuiltins);
    vireo.httpClient.setXMLHttpRequestImplementation(XMLHttpRequest);

    const notSupportedError = () => {
        throw new Error('Unsupported on this target');
    };

    const LogLabVIEWError = function (_ignoreReturnValueRef: unknown, _statusValueRef: unknown, codeValueRef: unknown, sourceValueRef: unknown) {
        const code = vireo.eggShell.readDouble(codeValueRef);
        const source = vireo.eggShell.readString(sourceValueRef);
        throw new Error(`LabVIEW error ${code} occured at ${source === '' ? 'unknown location' : source}`);
    };

    const OneButtonDialog = function (returnValueRef: unknown, messageTextValueRef: unknown, textOneValueRef: unknown) {
        const messageText = vireo.eggShell.readString(messageTextValueRef);
        const textOne = vireo.eggShell.readString(textOneValueRef);
        alert(messageText + (textOne !== '' ? ` (${textOne})` : ''));

        // Ignores the return value of the dialog, LabVIEW always returns true despite what was returned.
        vireo.eggShell.writeDouble(returnValueRef, 1);
    };

    vireo.javaScriptInvoke.registerInternalFunctions({
        ControlReference_GetControlObject: notSupportedError,
        PropertyNode_PropertyRead: notSupportedError,
        PropertyNode_PropertyWrite: notSupportedError,
        OneButtonDialog,
        TwoButtonDialog: notSupportedError,
        LogLabVIEWError,
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
