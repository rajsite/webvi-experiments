import { encode } from 'std/encoding/base64.ts';
import webviDenoConf from '../WebVIDeno.gcomp/deno.json' assert { type: "json" };

const vireoBasePath = webviDenoConf.imports['vireo/'];
const path = new URL(`${vireoBasePath}dist/wasm32-unknown-emscripten/release/vireo.core.wasm`);
const response = await fetch(path);
const data = await response.arrayBuffer();
const base64 = encode(data);
const dataUrl = `data:application/wasm;base64,${base64}`;
const module = `export const vireoDataUrl=\`${dataUrl}\`;`;
const pathOut = new URL('../WebVIDeno.gcomp/Support/dist/vireoDataUrl.js', import.meta.url);
await Deno.writeTextFile(pathOut, module);
