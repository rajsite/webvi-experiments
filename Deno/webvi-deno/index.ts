import { DOMParser, Element } from "./deps/x/deno_dom/deno-dom-wasm.ts";

import {run} from './run/runner.ts';

const htmlUrl = new URL('../Builds/WebApp_Default Web Server/index.html', import.meta.url);
const html = await Deno.readTextFile(htmlUrl);
const document = new DOMParser().parseFromString(html, 'text/html')!;  
const webApp = document.querySelector("ni-web-application")!;
const vireoSource = webApp.getAttribute('vireo-source')!;
const vireoSourceUrl = rebaseUrlFromWebAppRoot(htmlUrl, vireoSource);
const scripts = document.querySelectorAll('script:not([src*="ni-webvi-resource-v0"])')!;

for (const script of scripts) {
    const scriptSrc = (script as Element).getAttribute('src')!;
    const scriptUrl = rebaseUrlFromWebAppRoot(htmlUrl, scriptSrc);
    await import(scriptUrl.href);
}

function rebaseUrlFromWebAppRoot (htmlUrl: URL, relativePath: string) {
    const element = document.querySelector('script[src*="ni-webvi-resource-v0"]')!;
    const src = element.getAttribute('src')!;
    const relativePathToRoot = src.substring(0, src.indexOf('ni-webvi-resource-v0'));
    const baseUrl = new URL(relativePathToRoot, htmlUrl);
    const rebasedUrl = new URL(relativePath, baseUrl);
    return rebasedUrl;
}

await run(vireoSourceUrl);
