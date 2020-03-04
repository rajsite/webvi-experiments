(function () {
    'use strict';

    const stringOrDefault = function (val) {
        return typeof val === 'string' ? val : '';
    };

    const parseURL = function (url, base) {
        const parsed = base === '' ? new URL(url) : new URL(url, base);
        const parts = {
            href: stringOrDefault(parsed.href),
            origin: stringOrDefault(parsed.origin),
            protocol: stringOrDefault(parsed.protocol),
            username: stringOrDefault(parsed.username),
            password: stringOrDefault(parsed.password),
            host: stringOrDefault(parsed.host),
            hostname: stringOrDefault(parsed.hostname),
            port: stringOrDefault(parsed.port),
            pathname: stringOrDefault(parsed.pathname),
            search: stringOrDefault(parsed.search),
            hash: stringOrDefault(parsed.hash)
        };
        const partsJSON = JSON.stringify(parts);
        return partsJSON;
    };

    const parseURLSearchParams = function (search) {
        const parsed = new URLSearchParams(search);
        const parts = Array.from(parsed).map(function (param) {
            return {
                key: param[0],
                value: param[1]
            };
        });
        const partsJSON = JSON.stringify(parts);
        return partsJSON;
    };

    const getWindowLocation = function () {
        const url = window.location.href;
        return url;
    };

    const setWindowLocation = function (url) {
        window.location.href = url;
    };

    window.WebVIURL = {parseURL, parseURLSearchParams, getWindowLocation, setWindowLocation};
}());
