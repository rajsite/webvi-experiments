import { DOMParser, Element, Node } from "./deps/x/deno_dom/deno-dom-wasm.ts";

// Assumes main.html is at the root of the WebApp build output
const htmlUrl = new URL('../../../main.html', import.meta.url);
await makeMain(htmlUrl);

// Remove the webvi resources static files, not needed by the Deno main app
// TODO enable after: https://github.com/denoland/deploy_feedback/issues/348
// const webviResourcesUrl = new URL('./ni-webvi-resources-v0', htmlUrl);
// await Deno.remove(webviResourcesUrl, { recursive: true });

interface ExtractedUrls {
    vireoSource: string;
    scriptSources: string[];
}

async function makeMain (htmlUrl: URL) {
    const html = await Deno.readTextFile(htmlUrl);
    const mainUrl = new URL('main.ts', htmlUrl);
    
    const extractedUrls = extractUrls(html);
    const vireoCodeUrl = new URL(extractedUrls.vireoSource, htmlUrl);
    const vireoCode = await Deno.readTextFile(vireoCodeUrl);
    
    const main = createMainContent(extractedUrls, vireoCode);
    
    await Deno.writeTextFile(mainUrl, main);
}

function createMainContent (extractedUrls: ExtractedUrls, vireoCode: string) {
    const formattedScriptSources = extractedUrls.scriptSources
        .map(url => url.startsWith('.') ? url : `./${url}`)
        .map(url => `import '${url}';`)
        .join('\n');
    const base64 = btoa(vireoCode);
    const main = `
        ${formattedScriptSources}
        import {run} from './Deno/Support/src/run/runtime-helpers.ts';
        const viaCode = getViaCode();
        await run(viaCode);

        function getViaCode() {
            return atob('${base64}');
        }
    `;
    return main;
}

function extractUrls (html: string): ExtractedUrls {
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
