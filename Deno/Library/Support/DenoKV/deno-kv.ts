import { fromFileUrl } from '@std/path';
import { monotonicUlid } from "@std/ulid";

const kvOpen = async (pathURL: string) => {
    let path;
    if (pathURL === '') {
        path = undefined;
    } else if (pathURL === ':memory:') {
        path = pathURL;
    } else {
        path = fromFileUrl(pathURL);
    }
    const kvReference = await Deno.openKv(path);
    return kvReference;
};

const kvSetString = async (kvReference: Deno.Kv, keyJSON: string, value: string) => {
    const key = JSON.parse(keyJSON) as string[];
    await kvReference.set(key, value);
};

const kvGetString = async (kvReference: Deno.Kv, keyJSON: string) => {
    const key = JSON.parse(keyJSON) as string[];
    const result = await kvReference.get(key);
    return result.value;
};

const kvListString = async (kvReference: Deno.Kv, keyPrefixJSON: string, limit: number) => {
    const keyPrefix = JSON.parse(keyPrefixJSON) as string[];
    const entries = await kvReference.list({
        prefix: keyPrefix
    }, {
        limit: limit === 0 ? undefined : limit
    });
    const values = [];
    for await (const entry of entries) {
        values.push(entry.value);
    }
    const valuesJSON = JSON.stringify(values);
    return valuesJSON;
};

const kvMonotonicULID = () => {
    return monotonicUlid();
};

const kvClose = (kvReference: Deno.Kv) => {
    kvReference.close();
};

const api = {
    kvOpen,
    kvClose,
    kvSetString,
    kvGetString,
    kvListString,
    kvMonotonicULID
} as const;

declare namespace globalThis {
    let WebVIDenoKV: typeof api;
}

globalThis.WebVIDenoKV = api;
