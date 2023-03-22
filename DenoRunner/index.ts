import {runHTML} from './run/runner.ts';

const htmlUrl = new URL('../Deno/Builds/WebApp_Default Web Server/main.html', import.meta.url);
await runHTML(htmlUrl);
