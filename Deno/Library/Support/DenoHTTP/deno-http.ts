import { serveDir } from '@std/http';
import { fromFileUrl } from '@std/path';

class HTTPConnection {
    private readonly response: Promise<Response>;
    private readonly start = performance.now();
    private _resolve!: (response: Response) => void;
    constructor(
        public readonly request: Request,
    ) {
        this.response = new Promise(resolve => {
            this._resolve = resolve;
        });
    }

    public setResponse (response: Response): void {
        const end = performance.now();
        const total = end - this.start;
        const serverTimingValue = `webvi-time-to-response;dur=${total}`;
        response.headers.append('Server-Timing', serverTimingValue);
        console.log(`[${this.request.method}] ${new URL(this.request.url).pathname} ${response.status} ${Math.round(total)}ms`);
        this._resolve(response);
    }

    public async waitForResponse (): Promise<Response> {
        return await this.response;
    }

}

class HTTPListener {
    private readonly streamController: ReadableStreamDefaultController<HTTPConnection>;
    private readonly streamReader: ReadableStreamDefaultReader<HTTPConnection>;
    constructor(private readonly urlPattern: URLPattern, abortController: AbortController) {
        let steamController: ReadableStreamDefaultController<HTTPConnection>;
        const readableStream = new ReadableStream<HTTPConnection>({
            start: (controller) => {
                steamController = controller;
            }
        });
        // Server already cancelled so cancel reader instead of controller
        // to ignore pending invalid HTTPConnections
        abortController.signal.addEventListener('abort', () => this.streamReader.cancel());
        this.streamController = steamController!;
        this.streamReader = readableStream.getReader();
    }

    public shouldConnect (request: Request): boolean {
        return this.urlPattern.test(request.url);
    }

    public async waitForConnection (): Promise<HTTPConnection> {
        const result = await this.streamReader.read();
        if (result.done) {
            throw new Error('Connection closed');
        }
        return result.value;
    }

    public enqueueConnection (httpConnection: HTTPConnection): void {
        this.streamController.enqueue(httpConnection);
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

interface HTTPCreateListenersConfig {
    urlPatternConfigs: URLPatternConfig[];
    port: number;
    hostname: string;
}

const httpCreateListeners = function (configJSON: string): HTTPListener[] {
    const {urlPatternConfigs, port, hostname} = JSON.parse(configJSON) as HTTPCreateListenersConfig;
    const urlPatterns = urlPatternConfigs.map(urlPatternConfig => new URLPattern(urlPatternConfig));
    const abortController = new AbortController();
    const httpListeners = urlPatterns.map(urlPattern => new HTTPListener(urlPattern, abortController));
    Deno.serve({
        signal: abortController.signal,
        port,
        hostname
    }, async (request: Request): Promise<Response> => {
        for (const httpListener of httpListeners) {
            if (httpListener.shouldConnect(request)) {
                const httpConnection = new HTTPConnection(request);
                httpListener.enqueueConnection(httpConnection);
                return await httpConnection.waitForResponse();
            }
        }
        throw new Error(`Unhandled request ${request.url}`);
    });

    // TODO figure out returning the abort controller
    // Maybe closing any of the listeners kills the server?
    return httpListeners;
};

const httpWaitOnListener = async function (httpListener: HTTPListener): Promise<HTTPConnection> {
    const httpConnection = await httpListener.waitForConnection();
    return httpConnection;
};


const httpWriteResponse = function (httpConnection: HTTPConnection, body: string): void {
    httpConnection.setResponse(new Response(body));
};

const httpServeFiles = async function (httpListener: HTTPListener, rootPathUrl: string): Promise<void> {
    const fsRoot = fromFileUrl(rootPathUrl);
    while(true) {
        const httpConnection = await httpListener.waitForConnection();
        if (!httpConnection) {
            break;
        }
        const response = await serveDir(httpConnection.request, {
            fsRoot,
            quiet: true
        });
        httpConnection.setResponse(response);
    }
};

const httpConnectionGetRequest = function (httpConnection: HTTPConnection) {
    const request = {
        method: httpConnection.request.method,
        url: httpConnection.request.url,
        headers: [...httpConnection.request.headers.entries()].map(([name, value]) => ({name, value})),
    };
    const requestJSON = JSON.stringify(request);
    return requestJSON;
};

const api = {
    httpCreateListeners,
    httpWaitOnListener,
    httpWriteResponse,
    httpServeFiles,
    httpConnectionGetRequest
} as const;

declare namespace globalThis {
    let WebVIDenoHTTP: typeof api;
}

globalThis.WebVIDenoHTTP = api;
