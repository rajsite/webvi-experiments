import '../Deno/Builds/WebApp_Default Web Server/URL/Support/URL.js';
import '../Deno/Builds/WebApp_Default Web Server/DenoHTTP/Support/DenoHTTP.js';
import { run } from './run/runner.ts';
const viaCode = await Deno.readTextFile(new URL('../Deno/Builds/WebApp_Default Web Server/main.via.txt', import.meta.url));
await run(viaCode);
