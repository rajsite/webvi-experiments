import { serve } from "../deps/std/http/server.ts";
import { serveDir } from "../deps/std/http/file_server.ts";

class WebVIRequest {
    public readonly responsePromise;
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

const listenForRequests = async function (requestStreamReader: ReadableStreamDefaultReader<WebVIRequest>) {
    const {value, done} = await requestStreamReader.read();
    const result = [value, done] as const;
    return result;
};

const stopServer = async function (requestStreamReader: ReadableStreamDefaultReader<WebVIRequest>) {
    await requestStreamReader.cancel();
};

const makeResponse = (req: WebVIRequest) => {
    return () => {
        req.resolve(new Response(`hello world ${new Date()}`));
    }
};

let i=0;
const requestStream = startServer();
let req: readonly [WebVIRequest | undefined, boolean];
do {
    req = await listenForRequests(requestStream);
    console.log(`hello world ${i++}`);
    setTimeout(makeResponse(req[0]!), 2000);
} while (!req[1]);
