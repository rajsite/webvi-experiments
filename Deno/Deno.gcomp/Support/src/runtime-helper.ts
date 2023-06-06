import { XMLHttpRequest } from 'xhr/mod.ts';
import webviWebsockets from 'npm:webvi-websockets';
import vireoHelpers from 'npm:vireo';

async function createInstance () {
    const customGlobalWithBuiltins = Object.create(globalThis);
    customGlobalWithBuiltins.NationalInstrumentsWebSockets = webviWebsockets(WebSocket);

    const vireo = await vireoHelpers.createInstance({
        customModule: {
            locateFile: function (path, prefix) {
                return URL.createObjectURL(new Blob([
                    Deno.readFileSync(prefix + path)
                ], {
                    type: 'application/wasm'
                }));
            }
        }
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
