import { serve } from "../deps/std/http/server.ts";
import { serveDir } from "../deps/std/http/file_server.ts";
import { fromFileUrl } from "../deps/std/path/mod.ts";

let totalInstanceCount = 0;
class WebVIRequest {
    public readonly responsePromise;
    public readonly instanceCount = totalInstanceCount++;
    private _resolve!: (response: Response) => void;
    constructor(
        public readonly request: Request,
    ) {
        this.responsePromise = new Promise<Response>(resolve => {
            this._resolve = resolve;
        })
    }

    resolve (response: Response) {
        this._resolve(response);
    }
}

const startServer = function () {
    const abortController = new AbortController();
    const requestStream = new ReadableStream<WebVIRequest>({
        start (controller) {
            serve(async (request: Request): Promise<Response> => {
                const webviRequest = new WebVIRequest(request);
                console.time(`request: ${webviRequest.instanceCount}`);
                controller.enqueue(webviRequest);
                return await webviRequest.responsePromise;
            }, {
                signal: abortController.signal
            });
        },
        cancel () {
            abortController.abort();
        }
    });
    const requestStreamReader = requestStream.getReader();
    return requestStreamReader;
};

const listenForRequest = async function (requestStreamReader: ReadableStreamDefaultReader<WebVIRequest>) {
    const streamResult = await requestStreamReader.read();
    return streamResult;
};

const streamResultDone = function (streamResult: ReadableStreamDefaultReadResult<WebVIRequest>) {
    return streamResult.done;
}

const streamResultWebVIRequest = function (streamResult: ReadableStreamDefaultReadResult<WebVIRequest>) {
    return streamResult.value;
}

const stopServer = async function (requestStreamReader: ReadableStreamDefaultReader<WebVIRequest>) {
    await requestStreamReader.cancel();
};

const completeRequest = function (webviRequest: WebVIRequest, body: string) {
    webviRequest.resolve(new Response(body));
    console.timeEnd(`request: ${webviRequest.instanceCount}`);
}

const serveDirRequest = async function (webviRequest: WebVIRequest) {
    const response = await serveDir(webviRequest.request, {
        fsRoot: fromFileUrl(new URL('../../../', import.meta.url))
    });
    webviRequest.resolve(response);
    console.timeEnd(`request: ${webviRequest.instanceCount}`);
}

declare namespace globalThis {
    let WebVIDenoHTTP: unknown;
}

globalThis.WebVIDenoHTTP = {
    startServer,
    listenForRequest,
    stopServer,
    streamResultDone,
    streamResultWebVIRequest,
    completeRequest,
    serveDirRequest
};
