import { DOMParser, Element, Node } from '@b-fuze/deno-dom/wasm';
import { toFileUrl, resolve } from '@std/path';

interface ExtractedUrls {
    vireoSource: string;
    scriptSources: string[];
    relativePathToRoot: string;
}

async function convert (htmlUrl: URL) {
    const html = await Deno.readTextFile(htmlUrl);

    const name = new URL(htmlUrl).pathname.split('/').pop()!.split('.html').shift();
    const outUrl = new URL(`./${name}.ts`, htmlUrl);
    
    const extractedUrls = extractUrls(html);
    const viaCodeUrl = new URL(extractedUrls.vireoSource, htmlUrl);
    const viaCode = await Deno.readTextFile(viaCodeUrl);
    
    const content = createContent(extractedUrls, viaCode);
    
    await Deno.writeTextFile(outUrl, content);
}

function createContent (extractedUrls: ExtractedUrls, viaCode: string) {
    const formattedScriptSources = extractedUrls.scriptSources
        .map(url => url.startsWith('.') ? url : `./${url}`)
        .map(url => `import '${url}';`)
        .join('\n');
    const viaCodeLines = JSON.stringify(viaCode.split('\n'), undefined, 4);
    const mainTemplate = `
        ${formattedScriptSources}
        import { runViaCodeLines } from '${extractedUrls.relativePathToRoot}../../Library/Support/Runtime/runtime-helper.ts';
        await runViaCodeLines(viaCodeLines());
        function viaCodeLines () {
            return ${viaCodeLines};
        }
    `;
    const main = mainTemplate.split('\n')
        .map(line => line.trimStart())
        .join('\n');
    return main;
}

function extractUrls (html: string): ExtractedUrls {
    const document = new DOMParser().parseFromString(html, 'text/html')!;  
    const webApp = document.querySelector("ni-web-application")!;
    const vireoSource = webApp.getAttribute('vireo-source')!;
    const scripts = document.querySelectorAll('script:not([src*="ni-webvi-resource-v0"])')!;
    const scriptSources = Array.from(scripts)
        .map((script: Node) => (script as Element).getAttribute('src')!);
    const resourceScript = document.querySelector('script[src*="ni-webvi-resource-v0"]')!;
    const relativePathToRoot = resourceScript.getAttribute('src')!.split('ni-webvi-resource-v0').shift()!;
    const extractedUrls = {
        vireoSource,
        scriptSources,
        relativePathToRoot
    };
    return extractedUrls;
}

function getHtmlUrls (): URL[] {
    return Deno
        .args // Assumes args are relative paths to .via.txt files
        .map(htmlPath => toFileUrl(resolve(Deno.cwd(), htmlPath)))
        .map(viaUrl => new URL(viaUrl.href.split('.via.txt').shift()!.concat('.html')));
}

if (import.meta.main) {
    for (const htmlUrl of getHtmlUrls()) {
        await convert(htmlUrl);
    }
}
