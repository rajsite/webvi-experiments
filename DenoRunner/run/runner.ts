import { extractUrls } from "../parse/webvi-html.ts";
import { VireoDeno } from "./vireo-deno.ts";

export async function runHTML(htmlUrl: URL) {
    const extractedUrls = await extractUrls(htmlUrl);
    for (const scriptSource of extractedUrls.scriptSources) {
        const scriptUrl = new URL(scriptSource, htmlUrl);
        await import(scriptUrl.href);
    }
    const viaUrl = new URL(extractedUrls.vireoSource, htmlUrl);
    const viaCode = await Deno.readTextFile(viaUrl);
    await run(viaCode);
}

export async function run(viaCode: string) {
    const vireo = await VireoDeno.createInstance();
    vireo.eggShell.loadVia(viaCode);
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
}
