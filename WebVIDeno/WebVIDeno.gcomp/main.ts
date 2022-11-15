import "https://deno.land/x/xhr@0.1.0/mod.ts";

import vireoHelpers from './Support/node_modules/vireo/source/core/vireo.loader.wasm32-unknown-emscripten.release.js';

const url = new URL("./Support/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.core.wasm", import.meta.url);
var vireo = await vireoHelpers.createInstance({
    wasmUrl: url.href
});

var viaCode = `start(VirtualInstrument<(clump(Println("Hello, sky. I can fly.")))>)`;
vireo.eggShell.loadVia(viaCode);
await vireo.eggShell.executeSlicesUntilClumpsFinished();
console.log('finished :D');

