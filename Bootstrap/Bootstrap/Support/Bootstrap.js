(function () {
    'use strict';

    // Restore any previously imported jquery versions
    // eslint-disable-next-line id-length
    const $ = window.$.noConflict(true);

    // Currently the idea is have a single global navbar
    // Want to be able to reserve space for it early in page load
    const navbarParts = {
        brand: undefined,
        nav: undefined
    };

    const ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('readystatechange', function readyStateChangeHandler () {
                document.removeEventListener('readystatechange', readyStateChangeHandler);
                callback();
            });
        } else {
            callback();
        }
    };

    const createTemplateHandler = function (template) {
        const templateElement = document.createElement('template');
        templateElement.innerHTML = template;
        const fragment = templateElement.content;
        const querySelector = function (selector) {
            const elements = fragment.querySelectorAll(selector);
            if (elements.length !== 1) {
                throw new Error(`Expected one element with selector ${selector} but found ${elements.length} in template: ${template}`);
            }
            const element = elements[0];
            return element;
        };
        const querySelectors = function (selectors) {
            return selectors.map(querySelector);
        };
        return {querySelector, querySelectors};
    };

    const createNavbar = function () {
        // Documentation for bootstrap navbars:
        // https://getbootstrap.com/docs/4.0/components/navbar/

        // More bootstrap navbar examples:
        // https://getbootstrap.com/docs/4.0/examples/#navbars
        const navbarTemplate = `
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <a class="navbar-brand">&nbsp;</a>
            <button class="navbar-toggler" type="button" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav mr-auto">
                </ul>
            </div>
        </nav>
        `;
        const templateHandler = createTemplateHandler(navbarTemplate);

        navbarParts.brand = templateHandler.querySelector('.navbar-brand');
        navbarParts.nav = templateHandler.querySelector('.navbar-nav');

        const [toggler, collapse] = templateHandler.querySelectors(['.navbar-toggler', '.navbar-collapse']);
        $(toggler).click(() => $(collapse).collapse('toggle'));

        const navbar = templateHandler.querySelector('.navbar');
        document.body.insertAdjacentElement('afterbegin', navbar);
    };

    // Create navbar on load to hold space and prevent page shift
    ready(createNavbar);

    // NOTE this is different from urls in a JSLI document.
    // In the JSLI document relative urls are relative to the JSLI document and absolute urls are from the component root.
    // For this library relative urls are realtive to the Web Application Component root and absolute urls are relative to the window location.
    // This means the prefix '../' will point to a path outside the Web Application component and the prefix '/' will point to the root of the window location, not the Web Application component root.
    const rebaseUrlFromWebAppRoot = (function () {
        let baseUrl;
        return function (url) {
            if (baseUrl === undefined) {
                const element = document.querySelector('script[src*="ni-webvi-resource-v0"]');
                const src = element.getAttribute('src');
                const relativePathToRoot = src.substring(0, src.indexOf('ni-webvi-resource-v0'));
                baseUrl = new URL(relativePathToRoot, window.location);
            }
            const rebasedUrl = new URL(url, baseUrl);
            return rebasedUrl;
        };
    }());

    const setBrand = function (text, url) {
        const rebasedUrl = rebaseUrlFromWebAppRoot(url);
        navbarParts.brand.textContent = text;
        navbarParts.brand.href = rebasedUrl.href;
    };

    const trimIndex = function (url) {
        const urlWithoutIndex = url.replace(/index\.html$/, '');
        return urlWithoutIndex;
    };

    const appendNavItem = function (text, url) {
        const rebasedUrl = rebaseUrlFromWebAppRoot(url);
        const navItemTemplate = `
        <li class="nav-item">
            <a class="nav-link"></a>
        </li>
        `;
        const templateHandler = createTemplateHandler(navItemTemplate);

        const [navItem, navLink] = templateHandler.querySelectors(['.nav-item', '.nav-link']);
        navLink.textContent = text;
        navLink.href = rebasedUrl.href;

        const windowPathname = trimIndex(window.location.pathname);
        const rebasedUrlPathname = trimIndex(rebasedUrl.pathname);
        if (windowPathname === rebasedUrlPathname) {
            navItem.classList.add('active');
        }

        navbarParts.nav.appendChild(navItem);
    };

    window.WebVIBootstrap = {
        setBrand,
        appendNavItem
    };
}());
