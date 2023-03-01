import { serve } from "../deps/std/http/server.ts";
import { serveDir } from "../deps/std/http/file_server.ts";
import { VireoDeno } from "./vireo-deno.ts";

export const run = async (viaPath: URL) => {
    const viaCode = await Deno.readTextFile(viaPath);
    const vireo = await VireoDeno.createInstance();
    vireo.eggShell.loadVia(viaCode);
    await vireo.eggShell.executeSlicesUntilClumpsFinished();
    serve(async (req) => {
        return await serveDir(req);
    });
}
