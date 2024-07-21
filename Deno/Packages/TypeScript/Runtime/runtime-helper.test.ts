import { run } from "./runtime-helper.ts";

Deno.test(async function runtimeHelperHelloWorld() {
    await run('start(dv(VirtualInstrument (clump(Println("Hello, sky. I can fly")))))');
});
