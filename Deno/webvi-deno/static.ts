import '../Builds/Test/URL/Support/URL.js';
import '../Builds/Test/DenoHTTP/Support/DenoHTTP.js';

import {run} from './run/runner.ts';

await run(new URL('../Builds/WebApp_Default Web Server/index.via.txt', import.meta.url));
