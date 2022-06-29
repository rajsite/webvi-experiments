(function () {
    'use strict';

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
        // Editor does not support AbortController
        if (window.AbortController) {
            controller = new AbortController();
            timeoutAt(controller, timeout);
            optionsCopy.signal = controller.signal;
        }
        try {
            return await fetch(url, optionsCopy);
        } catch (ex) {
            // Editor does not support AbortController
            if (window.AbortController && controller.signal.aborted) {
                throw controller.signal.reason;
            }
            throw ex;
        }
    };

    const postMultipartExt = async function (requestConfigurationJSON, url, timeout, postDataJSON, postDataFiles) {
        const {includeCredentials, headersConfiguration} = JSON.parse(requestConfigurationJSON);
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

        const headers = new Headers();
        for (const {header, value} of headersConfiguration) {
            // Ignore a user set content-type header when doing Post multipart
            // so that the browser can configure the boundary parameter correctly
            if (header.trim().toLowerCase() !== 'content-type') {
                headers.append(header, value);
            }
        }

        const credentials = includeCredentials ? 'include' : 'same-origin';

        const options = {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials,
            redirect: 'follow',
            headers
        };

        const response = await fetchWithTimeout(url, timeout, options);
        const responseStatus = response.status;
        const responseHeaders = Array
            .from(response.headers.entries())
            .map(([header, value]) => `${header.trim()}: ${value.trim()}`)
            .join('\r\n');
        const responseBody = await response.text();

        const result = [
            responseStatus,
            responseHeaders,
            responseBody
        ];

        return result;
    };

    const typeCastValue = value => value;

    window.WebVIHTTPExtensions = {
        postMultipartExt,
        typeCastValue
    };
}());