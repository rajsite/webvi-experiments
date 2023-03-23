import { serve } from "../deps/std/http/server.ts";
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

class RequestListener {
    public readonly controller: ReadableStreamDefaultController<RequestHandler>;
    public readonly streamReader: ReadableStreamDefaultReader<RequestHandler>;
    constructor(public readonly urlPattern: URLPattern, abortController: AbortController) {
        let _controller: ReadableStreamDefaultController<RequestHandler>;
        const readableStream = new ReadableStream<RequestHandler>({
            start: (controller) => {
                _controller = controller;
            }
        });
        abortController.signal.addEventListener('abort', () => this.streamReader.cancel());
        this.controller = _controller!;
        this.streamReader = readableStream.getReader();
    }
}

interface URLPatternConfig {
    hash: string;
    hostname: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    username: string;
}

const startServer = function (urlPatternConfigsJSON: string): RequestListener[] {
    const urlPatternConfigs = JSON.parse(urlPatternConfigsJSON) as URLPatternConfig[];
    const urlPatterns = urlPatternConfigs.map(urlPatternConfig => new URLPattern(urlPatternConfig));
    const abortController = new AbortController();
    const requestListeners = urlPatterns.map(urlPattern => new RequestListener(urlPattern, abortController));
    serve(async (request: Request): Promise<Response> => {
        for (const requestListener of requestListeners) {
            if (requestListener.urlPattern.test(request.url)) {
                const requestHandler = new RequestHandler(request);
                requestListener.controller.enqueue(requestHandler);
                return await requestHandler.response;
            }
        }
        throw new Error('unhandled');
    }, {
        signal: abortController.signal
    });

    // TODO figure out returning the abort controller
    // Maybe closing any of the listeners kills the server?
    return requestListeners;
};

const listenForRequest = async function (requestListener: RequestListener): Promise<RequestHandler[]> {
    const streamResult = await requestListener.streamReader.read();
    if (streamResult.done) {
        return [];
    }
    return [streamResult.value];
};


const completeRequest = function (requestHandler: RequestHandler, body: string): void {
    requestHandler.complete(new Response(body));
};

const serveDirRequest = async function (requestHandler: RequestHandler): Promise<void> {
    const response = await serveDir(requestHandler.request, {
        fsRoot: fromFileUrl(new URL('../../../', import.meta.url))
    });
    requestHandler.complete(response);
};

declare namespace globalThis {
    let WebVIDenoHTTP: unknown;
}

globalThis.WebVIDenoHTTP = {
    startServer,
    listenForRequest,
    completeRequest,
    serveDirRequest
};
