import { ConnInfo, serve } from "../deps/std/http/server.ts";
import { serveDir } from "../deps/std/http/file_server.ts";
import { fromFileUrl } from "../deps/std/path/mod.ts";

class RequestHandler {
    private static totalInstanceCount = 0;
    public readonly response;
    private readonly instanceCount = RequestHandler.totalInstanceCount++;
    private _resolve!: (response: Response) => void;
    constructor(
        public readonly request: Request,
    ) {
        this.response = new Promise<Response>(resolve => {
            this._resolve = resolve;
        });
        console.time(`request: ${this.instanceCount}`);
    }

    complete (response: Response) {
        this._resolve(response);
        console.timeEnd(`request: ${this.instanceCount}`);
    }
}

const startServer = function (): ReadableStreamDefaultReader<RequestHandler> {
    const abortController = new AbortController();
    const requestStream = new ReadableStream<RequestHandler>({
        start (controller) {
            serve(async (request: Request, connInfo: ConnInfo): Promise<Response> => {
                const requestHandler = new RequestHandler(request);
                controller.enqueue(requestHandler);
                return await requestHandler.response;
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

const listenForRequest = async function (requestStreamReader: ReadableStreamDefaultReader<RequestHandler>): Promise<RequestHandler[]> {
    const streamResult = await requestStreamReader.read();
    if (streamResult.done) {
        return [];
    }
    return [streamResult.value];
};

const stopServer = async function (requestStreamReader: ReadableStreamDefaultReader<RequestHandler>): Promise<void> {
    await requestStreamReader.cancel();
};

const completeRequest = function (requestHandler: RequestHandler, body: string): void {
    requestHandler.complete(new Response(body));
    
}

const serveDirRequest = async function (requestHandler: RequestHandler): Promise<void> {
    const response = await serveDir(requestHandler.request, {
        fsRoot: fromFileUrl(new URL('../../../', import.meta.url))
    });
    requestHandler.complete(response);
}

declare namespace globalThis {
    let WebVIDenoHTTP: unknown;
}

globalThis.WebVIDenoHTTP = {
    startServer,
    listenForRequest,
    stopServer,
    completeRequest,
    serveDirRequest
};
