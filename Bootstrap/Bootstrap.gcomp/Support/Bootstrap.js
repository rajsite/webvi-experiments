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
        const template = document.createElement('template');
        template.innerHTML = navbarTemplate;
        const fragment = template.content;

        navbarParts.brand = fragment.querySelector('.navbar-brand');
        navbarParts.nav = fragment.querySelector('.navbar-nav');

        const toggler = fragment.querySelector('.navbar-toggler');
        const collapse = fragment.querySelector('.navbar-collapse');
        $(toggler).click(() => $(collapse).collapse('toggle'));

        const navbar = fragment.querySelector('.navbar');
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

    const appendNavItem = function (text, url) {
        const rebasedUrl = rebaseUrlFromWebAppRoot(url);
        const navItemTemplate = `
        <li class="nav-item">
            <a class="nav-link"></a>
        </li>
        `;
        const template = document.createElement('template');
        template.innerHTML = navItemTemplate;
        const fragment = template.content;

        const navItem = fragment.querySelector('.nav-item');
        const navLink = fragment.querySelector('.nav-link');
        navLink.textContent = text;
        navLink.href = rebasedUrl.href;

        const windowPathname = window.location.pathname;
        const rebasedUrlPathname = rebasedUrl.pathname;
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
