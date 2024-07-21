import { runViaCodeLines } from "./runtime-helper.ts";

Deno.test(async function runtimeHelperHelloWorld() {
    await runViaCodeLines(['start(dv(VirtualInstrument (clump(Println("Hello, sky. I can fly")))))']);
});
