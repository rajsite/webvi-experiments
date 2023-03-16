// loadd html urls
// load via text
// generate new runner ts file
import { extractUrls } from "../parse/webvi-html.ts";

const htmlURL = new URL('../../Builds/WebApp_Default Web Server/index.html', import.meta.url);
const extractedUrls = await extractUrls(htmlURL);
const staticRunnerUrl = new URL('index.ts', htmlURL);
const vireoCodeUrl = new URL(extractedUrls.vireoSource, htmlURL);
const vireoCode = await Deno.readTextFile(vireoCodeUrl);
const formattedScriptSources = extractedUrls.scriptSources
    .map(url => `import '${url.startsWith('.') ? '' : './'}${url}';`)
    .join('\n');
const formattedVireoCode = vireoCode.replaceAll('`', '\\`');
const staticFile = `
${formattedScriptSources}
import {run} from 'https://raw.githubusercontent.com/rajsite/webvi-experiments/37991e5e43b3c140fe5387b1c8df73ca96c22e19/Deno/webvi-deno/run/runner.ts';

const viaCode = \`
${formattedVireoCode}
\`;
await run(viaCode);
`;

await Deno.writeTextFile(staticRunnerUrl, staticFile);
