(function () {
    'use strict';

    const stripUrlEnd = function (urlString) {
        const url = new URL(urlString);
        const subPathIndex = url.pathname.lastIndexOf('/');
        const subPath = url.pathname.substring(0, subPathIndex + 1);
        // Rebuild url without any search params or hash
        const subUrl = url.origin + subPath;
        return subUrl;
    };

    const scriptUrl = document.currentScript.src;
    const windowUrl = window.location.toString();

    const getAugmentedRealityDirectoryUrl = function () {
        // Assumes knowledge of augmented reality relative path structure
        const scriptSubUrl = stripUrlEnd(scriptUrl);
        const unresolvedAugmentedRealityDirectoryUrl = scriptSubUrl + '../';
        const augmentedRealityDirectoryUrl = (new URL(unresolvedAugmentedRealityDirectoryUrl)).toString();
        return augmentedRealityDirectoryUrl;
    };
    const getTopLevelVIDirectoryUrl = function () {
        const topLevelVIDirectoryUrl = stripUrlEnd(windowUrl);
        return topLevelVIDirectoryUrl;
    };
    const includeARDependencies = function () {
        // intentionally blank
    };

    window.WebVIAugmentedReality = {
        getAugmentedRealityDirectoryUrl,
        getTopLevelVIDirectoryUrl,
        includeARDependencies
    };
}());
