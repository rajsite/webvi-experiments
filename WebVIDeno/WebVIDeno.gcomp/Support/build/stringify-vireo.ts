import { encode } from '../deps/std/encoding/base64.ts';

const vireoBasePath = 'https://unpkg.com/vireo@24.2.3/';
const path = new URL(`${vireoBasePath}dist/wasm32-unknown-emscripten/release/vireo.core.wasm`);
const response = await fetch(path);
const data = await response.arrayBuffer();
const base64 = encode(data);
const dataUrl = `data:application/wasm;base64,${base64}`;
const module = `export const vireoDataUrl=\`${dataUrl}\`;`;
const pathOut = new URL('../dist/vireoDataUrl.js', import.meta.url);
await Deno.writeTextFile(pathOut, module);
