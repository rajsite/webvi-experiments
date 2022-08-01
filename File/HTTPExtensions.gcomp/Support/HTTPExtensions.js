(function () {
    'use strict';

    // HttpClientManager api https://github.com/ni/VireoSDK/blob/673eb0dea01418f6ca20e6a2a53528a941eef7ca/source/io/module_httpClient.js#L412
    let httpClientManagerCached;
    const getHttpClientManager = function () {
        if (httpClientManagerCached === undefined) {
            const webAppElements = document.querySelectorAll('ni-web-application');
            if (webAppElements.length !== 1) {
                throw new Error('Cannot run HTTPExtensions, internal page issue: Expected a single ni-web-application element in page.');
            }
            const [webAppElement] = webAppElements;
            const vireo = webAppElement.vireoInstance;
            httpClientManagerCached = vireo.eggShell.internal_module_do_not_use_or_you_will_be_fired.httpClient.httpClientManager;
            if (httpClientManagerCached === undefined) {
                throw new Error('Cannot retrieve HTTPClientManager context. This function is only compatible with G Web Development Software 2022 Q3 or later.');
            }
        }
        return httpClientManagerCached;
    };

    const timeoutAt = function (controller, timeout) {
        if (timeout < 0) {
            return;
        }
        const setTimeoutToken = setTimeout(function () {
            controller.abort(new Error('Timeout'));
        }, timeout);
        controller.signal.addEventListener('abort', function () {
            clearTimeout(setTimeoutToken);
        });
    };

    const fetchWithTimeout = async function (url, timeout, options) {
        let controller;
        const optionsCopy = {...options};
        const httpClientManager = getHttpClientManager();
        // Editor does not support AbortController
        if (window.AbortController) {
            controller = new AbortController();
            timeoutAt(controller, timeout);
            optionsCopy.signal = controller.signal;
            httpClientManager._runningRequestsTracker.addRequest(controller);
        }
        try {
            return await fetch(url, optionsCopy);
        } catch (ex) {
            // Editor does not support AbortController
            if (window.AbortController && controller.signal.aborted) {
                throw controller.signal.reason;
            }
            throw ex;
        } finally {
            // Editor does not support AbortController
            if (window.AbortController) {
                httpClientManager._runningRequestsTracker.removeRequest(controller);
            }
        }
    };

    const createFetchOptions = function (method, handle) {
        const httpClientManager = getHttpClientManager();
        const httpClient = httpClientManager.get(handle);
        let headers = new Headers();
        let credentials = 'same-origin';
        if (httpClient !== undefined) {
            headers = new Headers(httpClient._headers);
            credentials = httpClient._includeCredentialsDuringCORS ? 'include' : 'same-origin';
        }
        const options = {
            method,
            headers,
            credentials,
            mode: 'cors',
            redirect: 'follow',
        };
        return options;
    };

    const createResult = function (response, responseBody) {
        const responseStatus = response.status;
        const responseHeaders = Array
            .from(response.headers.entries())
            .map(([header, value]) => `${header.trim()}: ${value.trim()}`)
            .join('\r\n');

        const result = [
            responseStatus,
            responseHeaders,
            responseBody
        ];
        return result;
    };

    const postMultipartExt = async function (handle, url, timeout, postDataJSON, postDataFiles) {
        const options = createFetchOptions('POST', handle);
        // Ignore a user set content-type header when doing Post multipart
        // so that the browser can configure the boundary parameter correctly
        options.headers.delete('content-type');

        const postData = JSON.parse(postDataJSON);
        const formData = new FormData();
        for (const {name, value, filename, mimeType, fileIndex} of postData) {
            if (name === '') {
                throw new Error('All postdata entries must have a name configured');
            }

            if (fileIndex >= 0) {
                const file = postDataFiles[fileIndex];
                if (filename === '') {
                    formData.append(name, file);
                } else {
                    formData.append(name, file, filename);
                }
            } else {
                if (filename === '') {
                    formData.append(name, value);
                } else {
                    const meta = {};
                    if (mimeType !== '') {
                        meta.type = mimeType;
                    }
                    formData.append(name, new File([value], filename, meta));
                }
            }
        }
        options.body = formData;

        const response = await fetchWithTimeout(url, timeout, options);
        return response;
    };

    const postMultipartExtString = async function (...args) {
        const response = await postMultipartExt(...args);
        const responseBody = await response.text();
        const result = createResult(response, responseBody);
        return result;
    };

    const getExt = async function (handle, url, timeout) {
        const options = createFetchOptions('GET', handle);
        const response = await fetchWithTimeout(url, timeout, options);
        return response;
    };

    const getExtFile = async function (...args) {
        const response = await getExt(...args);
        const blob = await response.blob();
        const responseBody = new File([blob], 'body');
        const result = createResult(response, responseBody);
        return result;
    };

    const typeCastValue = value => value;

    window.WebVIHTTPExtensions = {
        postMultipartExtString,
        getExtFile,
        typeCastValue
    };
}());
