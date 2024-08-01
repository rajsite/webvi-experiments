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

const kvListString = async (kvReference: Deno.Kv,
    keyPrefixJSON: string,
    limit: number,
    reverse: boolean
) => {
    const keyPrefix = JSON.parse(keyPrefixJSON) as string[];
    const results = await kvReference.list<string>({
        prefix: keyPrefix
    }, {
        limit: limit === 0 ? undefined : limit,
        reverse
    });
    const kvEntries = await Array.fromAsync(results, ({
        key,
        value
    }) => ({
        key,
        value
    }));
    const kvEntriesJSON = JSON.stringify(kvEntries);
    return kvEntriesJSON;
};

const kvDelete = async (kvReference: Deno.Kv, keyJSON: string) => {
    const key = JSON.parse(keyJSON) as string[];
    await kvReference.delete(key);
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
    kvDelete,
    kvMonotonicULID
} as const;

declare namespace globalThis {
    let WebVIDenoKV: typeof api;
}

globalThis.WebVIDenoKV = api;
