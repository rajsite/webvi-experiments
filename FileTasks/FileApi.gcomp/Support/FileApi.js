(function () {
    'use strict';

    const createObjectUrlWithMetadata = function (blobOrFile) {
        const fileObjectUrlInitial = URL.createObjectURL(blobOrFile);
        const url = new URL(fileObjectUrlInitial);

        // We rely on using the hash to store file metadata
        if (url.hash !== '') {
            URL.revokeObjectURL(blobOrFile);
            throw new Error('File API Unsupported: cannot store file metadata on blob url');
        }

        const metadata = new URLSearchParams();
        metadata.set('name', typeof blobOrFile.name === 'string' ? blobOrFile.name : '');
        url.hash = metadata.toString();
        const fileObjectUrl = url.toString();
        return fileObjectUrl;
    };

    const getObjectUrlMetadata = function (fileObjectUrl) {
        const url = new URL(fileObjectUrl);
        const metadata = new URLSearchParams(url.hash.substring(1));
        const result = {name: metadata.get('name')};
        if (typeof result.name !== 'string') {
            throw new Error('File API Unsupported: cannot retrieve file metadata on blob url');
        }
        return result;
    };

    const clearObjectUrlMetadata = function (fileObjectUrl) {
        const urlWithMetadata = new URL(fileObjectUrl);
        urlWithMetadata.hash = '';
        const url = urlWithMetadata.toString();
        return url;
    };

    const createFile = function (uint8Array, contentType, name) {
        const file = new File([uint8Array], name, {type: contentType});
        const fileObjectUrl = createObjectUrlWithMetadata(file);
        return fileObjectUrl;
    };

    const closeFile = function (fileObjectUrl) {
        const url = clearObjectUrlMetadata(fileObjectUrl);
        URL.revokeObjectURL(url);
    };

    const readFile = async function (fileObjectUrl) {
        const url = clearObjectUrlMetadata(fileObjectUrl);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    };

    // TODO just use filename from metadata? maybe allow override?
    const downloadFile = function (fileObjectUrl, name) {
        // support for the download attribute is coming in iOS 13: https://bugs.webkit.org/show_bug.cgi?id=167341
        if ('download' in HTMLAnchorElement.prototype === false) {
            throw new Error('Browser does not support anchor download attribute, unable to trigger download');
        }
        const url = clearObjectUrlMetadata(fileObjectUrl);
        const downloadElement = document.createElement('a');
        downloadElement.download = name;
        downloadElement.href = url;
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
        // TODO revoking a copy later is difficult.. don't know when download has finished, not sure if revoke during dl is an issue
    };

    const getFileObjectUrl = function (fileObjectUrl) {
        const url = clearObjectUrlMetadata(fileObjectUrl);
        return url;
    };

    const getFileMetadata = function (fileObjectUrl) {
        const fileMetadata = getObjectUrlMetadata(fileObjectUrl);
        const fileMetadataJSON = JSON.stringify(fileMetadata);
        return fileMetadataJSON;
    };

    window.WebVIFileApi = {
        createFile,
        closeFile,
        readFile,
        downloadFile,
        getFileObjectUrl,
        getFileMetadata
    };
}());
