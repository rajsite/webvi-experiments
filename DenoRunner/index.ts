import {runHTML} from './run/runner.ts';

const htmlUrl = new URL('../Deno/Builds/WebApp_Default Web Server/index.html', import.meta.url);
await runHTML(htmlUrl);
