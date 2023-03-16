import '../Builds/WebApp_Default Web Server/URL/Support/URL.js';
import '../Builds/WebApp_Default Web Server/DenoHTTP/Support/DenoHTTP.js';
import { run } from './run/runner.ts';
const viaCode = await Deno.readTextFile(new URL('../Builds/WebApp_Default Web Server/index.via.txt', import.meta.url));

const base64 = btoa(viaCode);
const data = atob(base64);
await run(data);
