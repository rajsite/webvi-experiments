(function () {
    'use strict';

    // Assume loading with classic script tag (not defer, async, or module)
    const scriptFileUrl = document.currentScript.src;

    const stripUrlEnd = function (urlString) {
        const url = new URL(urlString);
        const subPathIndex = url.pathname.lastIndexOf('/');
        const subPath = url.pathname.substring(0, subPathIndex + 1);
        // Rebuild url without any search params or hash
        const subUrl = url.origin + subPath;
        return subUrl;
    };

    const getLibraryDirectoryUrl = function () {
        const scriptDirectoryUrl = stripUrlEnd(scriptFileUrl);
        // Up one directory from Support namespace to library component root
        const unresolvedLibraryDirectoryUrl = scriptDirectoryUrl + '../';
        const libraryDirectoryUrl = (new URL(unresolvedLibraryDirectoryUrl)).toString();
        return libraryDirectoryUrl;
    };

    // Returns the Web Application root directory (ONLY IN DEPLOYED PAGES, INVALID AT EDIT TIME)
    const getWebApplicationDirectoryUrl = function () {
        const libraryDirectoryUrl = getLibraryDirectoryUrl();
        // Up one directory from the library to the root of the web application (ONLY IN DEPLOYED PAGES)
        const unresolvedWebApplicationDirectoryUrl = libraryDirectoryUrl + '../';
        const webApplicationDirectoryUrl = (new URL(unresolvedWebApplicationDirectoryUrl)).toString();
        return webApplicationDirectoryUrl;
    };

    const insertHtmlBeforeFrontPanelWrapper = function (htmlToInsert) {
        const elements = document.querySelectorAll('.ni-front-panel-wrapper');
        if (elements.length !== 1) {
            throw new Error(`Expected to find one ni-front-panel-wrapper but found ${elements.length}`);
        }
        const frontPanelWrapper = elements[0];
        frontPanelWrapper.insertAdjacentHTML('beforebegin', htmlToInsert);
    };

    window.WebVIPanelManipulation = {
        getWebApplicationDirectoryUrl,
        insertHtmlBeforeFrontPanelWrapper
    };
}());
