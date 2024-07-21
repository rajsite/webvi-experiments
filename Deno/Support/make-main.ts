import { DOMParser, Element, Node } from '@b-fuze/deno-dom/wasm';

// Assumes main.html is at the root of the WebApp build output
const htmlUrl = new URL('../Builds/Server_Default Web Server/main.html', import.meta.url);

interface ExtractedUrls {
    vireoSource: string;
    scriptSources: string[];
}

async function makeMain (htmlUrl: URL) {
    const html = await Deno.readTextFile(htmlUrl);
    const mainUrl = new URL('main.ts', htmlUrl);
    
    const extractedUrls = extractUrls(html);
    const viaCodeUrl = new URL(extractedUrls.vireoSource, htmlUrl);
    const viaCode = await Deno.readTextFile(viaCodeUrl);
    
    const main = createMainContent(extractedUrls, viaCode);
    
    await Deno.writeTextFile(mainUrl, main);
}

function createMainContent (extractedUrls: ExtractedUrls, viaCode: string) {
    const formattedScriptSources = extractedUrls.scriptSources
        .map(url => url.startsWith('.') ? url : `./${url}`)
        .map(url => `import '${url}';`)
        .join('\n');
    const viaCodeLines = JSON.stringify(viaCode.split('\n'), undefined, 4);
    const mainTemplate = `
        ${formattedScriptSources}
        import { runViaCodeLines } from '../../Library/Support/Runtime/runtime-helper.ts';
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
    const extractedUrls = {
        vireoSource,
        scriptSources
    };
    return extractedUrls;
}

if (import.meta.main) {
    await makeMain(htmlUrl);
}
