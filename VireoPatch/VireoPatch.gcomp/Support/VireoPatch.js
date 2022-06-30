import vireoHelpersOriginal from './node_modules/vireo/source/core/vireo.loader.wasm32-unknown-emscripten.profile.js';

const vireoHelpers = {
    ...vireoHelpersOriginal,
    createInstance: (configOriginal, ...args) => {
        const wasmUrl = (new URL('node_modules/vireo/dist/wasm32-unknown-emscripten/profile/vireo.core.wasm', import.meta.url)).href;
        const config = {
            ...configOriginal,
            wasmUrl
        };
        return vireoHelpersOriginal.createInstance(config, ...args);
    }
};

window.vireoHelpers = vireoHelpers;

const applyVireoPatch = () => {};
window.WebVIVireoPatch = {
    applyVireoPatch
};
