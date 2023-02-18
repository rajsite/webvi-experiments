import { encode } from 'https://deno.land/std/encoding/base64.ts';

const path = new URL('https://unpkg.com/vireo@24.2.3/dist/wasm32-unknown-emscripten/release/vireo.core.wasm');
const response = await fetch(path);
const data = await response.arrayBuffer();
const base64 = encode(data);
const dataUrl = `data:application/wasm;base64,${base64}`;
const module = `export const vireoDataUrl=\`${dataUrl}\`;`;
const encoder = new TextEncoder();
const moduleData = encoder.encode(module);
const pathOut = new URL('../WebVIDeno.gcomp/Support/dist/vireoDataUrl.js', import.meta.url);
await Deno.writeFile(pathOut, moduleData);
