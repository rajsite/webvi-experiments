
const vireoUrl = new URL('../Library/Support/Runtime/Support/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.core.wasm', import.meta.url);
const data = await Deno.readFile(vireoUrl);
const encodedData = encode(data);
const vireoDataUrlContents = `export const vireoDataUrl = 'data:application/wasm;base64,${encodedData}';`;
const vireoDataUrlContentsPath = new URL('../Library/Support/Runtime/Support/vireo-data-url.js', import.meta.url);

function encode (data: Uint8Array) {
    let binaryString = '';
    for (let i = 0; i < data.length; i++) {
        binaryString += String.fromCharCode(data[i]);
    }
    const encodedData = btoa(binaryString);
    return encodedData;
};

if (import.meta.main) {
    await Deno.writeTextFile(vireoDataUrlContentsPath, vireoDataUrlContents);
}
