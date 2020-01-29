(function () {
    'use strict';
    if (document.readyState !== 'loading') {
        console.log('Preload script loaded too late to be effective. Should be loaded as a classic script tag.');
        return;
    }

    const createFetchPreload = function (url) {
        const link = document.createElement('link');
        link.href = url;
        link.rel = 'preload';
        link.as = 'fetch';
        link.crossOrigin = '';
        return link;
    };

    const preloadRuntime = function () {
        const webAppElement = document.querySelector('ni-web-application');
        const vireoSource = webAppElement.getAttribute('vireo-source');
        const vireoSourcePreload = createFetchPreload(vireoSource);
        document.head.appendChild(vireoSourcePreload);

        const wasmUrl = webAppElement.getAttribute('wasm-url');
        const wasmUrlPreload = createFetchPreload(wasmUrl);
        document.head.appendChild(wasmUrlPreload);
    };

    const prerenderUrl = function (urlElement) {
        const href = urlElement.getAttribute('href');
        const content = urlElement.getAttribute('content');
        const childElement = document.createElement('a');
        childElement.href = href;
        childElement.textContent = content;
        childElement.classList.add('jqx-container');
        urlElement.appendChild(childElement);
    };

    const prerenderImage = function (imageElement) {
        const source = imageElement.getAttribute('source');
        const stretch = imageElement.getAttribute('stretch');
        const alternate = imageElement.getAttribute('alternate');

        const childElement = document.createElement('div');
        childElement.classList.add('ni-image-box');
        childElement.style.width = '100%';
        childElement.style.height = '100%';

        if (source !== '') {
            childElement.style.backgroundImage = 'url(' + source + ')';
        }

        childElement.classList.add('ni-stretch-' + stretch);

        childElement.title = alternate;
        imageElement.innerHTML = '';
        imageElement.appendChild(childElement);
    };

    const prerenderText = function (textElement) {
        const initialContent = textElement.getAttribute('text');
        const newContent = document.createElement('div');
        newContent.textContent = initialContent;
        textElement.innerHTML = '';
        textElement.appendChild(newContent);
    };

    const clearPrerenderText = function (textElement) {
        textElement.innerHTML = '';
    };

    const prerender = function () {
        const textElements = Array.from(document.querySelectorAll('ni-text'));
        textElements.forEach(prerenderText);
        const imgElements = Array.from(document.querySelectorAll('ni-url-image'));
        imgElements.forEach(prerenderImage);
        const urlElements = Array.from(document.querySelectorAll('ni-hyperlink'));
        urlElements.forEach(prerenderUrl);
        preloadRuntime();
    };

    const clearPrerender = function () {
        const textElements = Array.from(document.querySelectorAll('ni-text'));
        textElements.forEach(clearPrerenderText);
    };

    // Bulk of WebVI scripts are defer loaded so run after the interactive transition
    // We can modify the page content without blocking on the other scripts and prerender some content in controls
    document.addEventListener('readystatechange', function () {
        if (document.readyState === 'interactive') {
            prerender();
        } else if (document.readyState === 'complete') {
            clearPrerender();
        }
    });

    window.WebVIPrerender = function () {
        // intentionally blank
    };
}());
