import { VireoDeno } from "./vireo-deno.ts";

export const run = async (viaPath: URL) => {
    const viaCode = await Deno.readTextFile(viaPath);
    const vireo = await VireoDeno.createInstance();
    vireo.eggShell.loadVia(viaCode);
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
}
