import { extractUrls } from "../parse/webvi-html.ts";
import { VireoDeno } from "./vireo-deno.ts";

export async function runHTML(htmlUrl: URL) {
    const extractedUrls = await extractUrls(htmlUrl);
    for (const script of extractedUrls.scriptUrls) {
        await import(script.href);
    }
    await run(extractedUrls.vireoSourceUrl);
}

export async function run(viaUrl: URL) {
    const viaCode = await Deno.readTextFile(viaUrl);
    const vireo = await VireoDeno.createInstance();
    vireo.eggShell.loadVia(viaCode);
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
}
