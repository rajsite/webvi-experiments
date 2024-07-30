import { toFileUrl } from '@std/path';

const envGet = (name: string) => {
    const value = Deno.env.get(name);
    if (value === undefined) {
        throw new Error(`Environment variable not defined: ${name}`)
    }
    return value;
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
