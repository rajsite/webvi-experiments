(function () {
    'use strict';
    // Path to generated service worker file relative to WebWapp root
    const serviceWorkerRelativePath = './sw.js';

    // Helps calculate URLs relative to the WebApp root.
    const rebaseUrlFromWebAppRoot = function (url) {
        const element = document.querySelector('script[src*="ni-webvi-resource-v0"]');
        const src = element.getAttribute('src');
        const relativePathToRoot = src.substring(0, src.indexOf('ni-webvi-resource-v0'));
        const baseUrl = new URL(relativePathToRoot, window.location);
        const rebasedUrl = new URL(url, baseUrl);
        return rebasedUrl;
    };

    const loadWorker = async function () {
        const serviceWorkerPath = rebaseUrlFromWebAppRoot(serviceWorkerRelativePath);
        try {
            await navigator.serviceWorker.register(serviceWorkerPath);
        } catch (ex) {
            console.log(`Unable to register service worker. Make sure it has been built. Error: ${ex} `);
        }
    };

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => loadWorker());
    }

    const register = function () {
        // Intentionally empty, relying on script being included in page at load time
    };

    window.WebVIServiceWorker = {register};
}());
