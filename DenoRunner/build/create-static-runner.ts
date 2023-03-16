// loadd html urls
// load via text
// generate new runner ts file
import { extractUrls } from "../parse/webvi-html.ts";

const htmlURL = new URL('../../Deno/Builds/WebApp_Default Web Server/index.html', import.meta.url);
const extractedUrls = await extractUrls(htmlURL);
const staticRunnerUrl = new URL('index.ts', htmlURL);
const vireoCodeUrl = new URL(extractedUrls.vireoSource, htmlURL);
const vireoCode = await Deno.readTextFile(vireoCodeUrl);
const formattedScriptSources = extractedUrls.scriptSources
    .map(url => url.startsWith('.') ? url : `./${url}`)
    .map(url => `import '${url}';`)
    .join('\n');
const base64 = btoa(vireoCode);
const staticFile = `
${formattedScriptSources}
import {run} from 'https://raw.githubusercontent.com/rajsite/webvi-experiments/ea259f96644f0285775642784206a4b38bbb170a/Deno/webvi-deno/run/runner.ts';
const viaCode = getViaCode();
await run(viaCode);

function getViaCode() {
    return atob('${base64}');
}
`;

await Deno.writeTextFile(staticRunnerUrl, staticFile);
