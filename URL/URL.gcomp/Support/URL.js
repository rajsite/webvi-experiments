(function () {
    'use strict';

    const validateEventStreamReader = function (eventStreamReader) {
        // NXG 5 does not include the ReadableStreamDefaultReader in the global scope so skip validation
        if (window.ReadableStreamDefaultReader === undefined) {
            return;
        }
        if (eventStreamReader instanceof window.ReadableStreamDefaultReader === false) {
            throw new Error('Input is not a valid event stream reader');
        }
    };

    const stringOrDefault = function (val) {
        return typeof val === 'string' ? val : '';
    };

    const urlCalculateRelative = function (relativeURL, baseURL) {
        const urlInstance = baseURL === '' ? new URL(relativeURL, window.location.href) : new URL(relativeURL, baseURL);
        return urlInstance.href;
    };

    const urlGetParts = function (url) {
        const urlInstance = new URL(url);
        const urlParts = {
            href: stringOrDefault(urlInstance.href),
            origin: stringOrDefault(urlInstance.origin),
            protocol: stringOrDefault(urlInstance.protocol),
            username: stringOrDefault(urlInstance.username),
            password: stringOrDefault(urlInstance.password),
            host: stringOrDefault(urlInstance.host),
            hostname: stringOrDefault(urlInstance.hostname),
            port: stringOrDefault(urlInstance.port),
            pathname: stringOrDefault(urlInstance.pathname),
            search: stringOrDefault(urlInstance.search),
            hash: stringOrDefault(urlInstance.hash)
        };
        const urlPartsJSON = JSON.stringify(urlParts);
        return urlPartsJSON;
    };

    const urlSetPart = function (url, name, value) {
        const urlInstance = new URL(url);
        urlInstance[name] = value;
        return urlInstance.href;
    };

    const urlDownload = function (url, fileName) {
        const downloadElement = document.createElement('a');
        document.body.appendChild(downloadElement);

        downloadElement.download = fileName;
        downloadElement.href = url;
        downloadElement.rel = 'noopener';

        downloadElement.click();
        document.body.removeChild(downloadElement);
    };

    const parseQueryString = function (queryString, trimHash) {
        const formattedQueryString = trimHash && queryString[0] === '#' ? queryString.substr(1) : queryString;
        const urlSearchParams = new URLSearchParams(formattedQueryString);
        return urlSearchParams;
    };

    const queryStringFromParameters = function (queryStringPartsJSON) {
        const queryStringParts = JSON.parse(queryStringPartsJSON);
        const params = queryStringParts.map(queryStringPart => {
            const {key, value} = queryStringPart;
            const param = [key, value];
            return param;
        });
        const urlSearchParams = new URLSearchParams(params);
        const queryString = urlSearchParams.toString();
        return queryString;
    };

    const queryStringGetParameters = function (queryString, trimHash) {
        const urlSearchParams = parseQueryString(queryString, trimHash);
        const params = Array.from(urlSearchParams);
        const queryStringParts = params.map(param => {
            const [key, value] = param;
            const queryStringPart = {key, value};
            return queryStringPart;
        });
        const queryStringPartsJSON = JSON.stringify(queryStringParts);
        return queryStringPartsJSON;
    };

    const queryStringGetParameter = function (queryString, trimHash, key) {
        const urlSearchParams = parseQueryString(queryString, trimHash);
        const exists = urlSearchParams.has(key);
        const value = urlSearchParams.get(key);
        const result = {
            exists,
            value: exists ? value : ''
        };
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    const queryStringSetParameter = function (queryString, trimHash, key, value) {
        const urlSearchParams = parseQueryString(queryString, trimHash);
        urlSearchParams.set(key, value);
        const result = urlSearchParams.toString();
        return result;
    };

    const queryStringDeleteParameter = function (queryString, trimHash, key) {
        const urlSearchParams = parseQueryString(queryString, trimHash);
        urlSearchParams.delete(key);
        const result = urlSearchParams.toString();
        return result;
    };

    const getWindowLocation = function () {
        const url = window.location.href;
        return url;
    };

    const setWindowLocation = function (action, url) {
        if (action === 'set') {
            // Pushes a new history item onto the history stack and updates url bar.
            // Causes the browser to navigate to the new URL.
            // Triggers a popstate event
            window.location.href = url;
        } else if (action === 'push') {
            // Pushes a new history item into the history stack and updates url bar.
            // Does not cause the browser to navigate / load a new URL.
            // Does not trigger a popstate event
            window.history.pushState({}, '', url);
        } else if (action === 'replace') {
            // Replaces the current history item on the history stack and updates the url bar.
            // Does not cause the browser to navigate / load to a new URL.
            // Does not trigger a popstate event
            window.history.replaceState({}, '', url);
        } else {
            throw new Error(`Unexpected set window location action: ${action}`);
        }
    };

    const reloadWindowLocation = function () {
        window.location.reload();
    };

    const addLocationEventListener = function () {
        let handler;
        const eventStream = new ReadableStream({
            start (controller) {
                handler = () => {
                    controller.enqueue(window.location.href);
                };
                window.addEventListener('popstate', handler);
            },
            cancel () {
                window.removeEventListener('popstate', handler);
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const listenForLocationEvents = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        const {value, done} = await eventStreamReader.read();
        const result = {
            value: done ? '' : value,
            done
        };
        const resultJSON = JSON.stringify(result);
        return resultJSON;
    };

    const removeLocationEventListener = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        await eventStreamReader.cancel();
    };

    window.WebVIURL = {
        urlCalculateRelative,
        urlGetParts,
        urlSetPart,
        urlDownload,
        queryStringFromParameters,
        queryStringGetParameters,
        queryStringGetParameter,
        queryStringSetParameter,
        queryStringDeleteParameter,
        getWindowLocation,
        setWindowLocation,
        reloadWindowLocation,
        addLocationEventListener,
        listenForLocationEvents,
        removeLocationEventListener
    };
}());
