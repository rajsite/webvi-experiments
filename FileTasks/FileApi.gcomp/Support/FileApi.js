(function () {
    'use strict';

    const createFile = function (uint8Array, contentType) {
        const blob = new Blob([uint8Array], {type: contentType});
        const fileObjectUrl = URL.createObjectURL(blob);
        return fileObjectUrl;
    };

    const closeFile = function (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
    };

    const readFile = async function (fileObjectUrl) {
        const response = await fetch(fileObjectUrl);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    };

    const downloadFile = function (fileObjectUrl, fileName) {
        // support for the download attribute is coming in iOS 13: https://bugs.webkit.org/show_bug.cgi?id=167341
        if ('download' in HTMLAnchorElement.prototype === false) {
            throw new Error('Browser does not support anchor download attribute, unable to trigger download');
        }

        const downloadElement = document.createElement('a');
        downloadElement.download = fileName;
        downloadElement.href = fileObjectUrl;
        downloadElement.rel = 'noopener';

        // Had to append the element to the DOM first for Firefox (not needed for Chrome, Edge, and Safari untested)
        // See https://stackoverflow.com/a/27116581
        // looks like appending to the dom prevents the issue with revoking too quickly from below in firefox (issue continues in Edge, safari untested)
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);

        // If the fileObjectUrl is revoked too quickly this fails in Firefox and Edge (Safari untested)
        // See https://github.com/eligrey/FileSaver.js/issues/205#issuecomment-503370302
        // TODO consider making a copy that gets revoked later. might not be useful since bad behavior is only in Edge (not a problem in Edgium, safari untested)
    };

    window.WebVIFileApi = {
        createFile,
        closeFile,
        readFile,
        downloadFile
    };
}());
