import vireoHelpers from '../Support/node_modules/vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';
import { ViaHelpers } from './via-helpers.ts';
import "https://deno.land/x/xhr@0.2.1/mod.ts";
import "../Support/node_modules/webvi-websockets/source/main.js";

declare namespace globalThis {
    let NationalInstrumentsWebSockets: any;
}

export class VireoDeno {
    static async createInstance (customGlobal?: any) {
        const customGlobalWithBuiltins = customGlobal === undefined ? Object.create(globalThis) : Object.create(customGlobal);
        customGlobalWithBuiltins.NationalInstrumentsWebSockets = globalThis.NationalInstrumentsWebSockets;

        const url = new URL("../Support/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.core.wasm", import.meta.url);
        const vireo = await vireoHelpers.createInstance({
            wasmUrl: url.href
        });

        vireo.javaScriptInvoke.registerCustomGlobal(customGlobalWithBuiltins);

        const notSupportedError = () => {
            throw new Error('Unsupported on this target');
        };

        const logLabVIEWError = function (_ignoreReturnValueRef: any, _statusValueRef: any, codeValueRef: any, sourceValueRef: any) {
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
