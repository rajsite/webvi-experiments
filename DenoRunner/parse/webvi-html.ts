import { DOMParser, Element, Node } from "../deps/x/deno_dom/deno-dom-wasm.ts";

export async function extractUrls (htmlUrl: URL) {
    const html = await Deno.readTextFile(htmlUrl);
    const document = new DOMParser().parseFromString(html, 'text/html')!;  
    const webApp = document.querySelector("ni-web-application")!;
    const vireoSource = webApp.getAttribute('vireo-source')!;
    const scripts = document.querySelectorAll('script:not([src*="ni-webvi-resource-v0"])')!;
    const scriptSources = Array.from(scripts)
        .map((script: Node) => (script as Element).getAttribute('src')!);
    const extractedUrls = {
        vireoSource,
        scriptSources
    };
    return extractedUrls;
}
