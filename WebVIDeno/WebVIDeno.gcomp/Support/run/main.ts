import { serve } from "../deps/std/http/server.ts";
import { serveDir } from "../deps/std/http/file_server.ts";
import { VireoDeno } from "./vireo-deno.ts";
const vireo = await VireoDeno.createInstance();
const viaCode = `start(VirtualInstrument<(clump(Println("Hello, sky. I can fly.")))>)`;
vireo.eggShell.loadVia(viaCode);
await vireo.eggShell.executeSlicesUntilClumpsFinished();
console.log('finished :D');

serve(async (req) => {
    return await serveDir(req);
});
