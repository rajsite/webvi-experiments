import { toFileUrl } from '@std/path';

const envGet = (name: string) => {
    return Deno.env.get(name);
}
const cwdGet = () => {
    const cwd = Deno.cwd();
    const cwdUrl = `${toFileUrl(cwd).href}/`;
    return cwdUrl;
}

const api = {
    envGet,
    cwdGet
} as const;

declare namespace globalThis {
    let WebVIDeno: typeof api;
}

globalThis.WebVIDeno = api;
