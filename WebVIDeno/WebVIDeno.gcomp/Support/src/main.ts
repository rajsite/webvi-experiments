import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";
import { VireoDeno } from "./vireo-deno.ts";
const vireo = await VireoDeno.createInstance();
const viaCode = `start(VirtualInstrument<(clump(Println("Hello, sky. I can fly.")))>)`;
vireo.eggShell.loadVia(viaCode);
await vireo.eggShell.executeSlicesUntilClumpsFinished();
console.log('finished :D');

serve(async (req) => {
    return await serveDir(req);
});
