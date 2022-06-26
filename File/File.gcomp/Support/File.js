(function () {
    'use strict';

    let isInBrowser;
    const validateCanDownload = function () {
        if (isInBrowser === undefined) {
            const webAppElements = document.querySelectorAll('ni-web-application');
            if (webAppElements.length !== 1) {
                console.log('Expected a single ni-web-application element in page for debugging.');
                return;
            }
            const [webAppElement] = webAppElements;
            isInBrowser = webAppElement.location === 'BROWSER';
        }
        // Note: This check may need to be revisted if the editor supports this in the future
        // it currently just assumes the editor cannot download a file
        if (!isInBrowser) {
            throw new Error('Downloading a file can only performed when using Run in Browser or in a deployed web application. A file download cannot be triggered when running in the editor.');
        }
        if ('download' in HTMLAnchorElement.prototype === false) {
            throw new Error('Browser does not support anchor download attribute, unable to trigger download');
        }
    };

    const validateFile = function (reference) {
        if (reference instanceof File === false) {
            throw new Error('Reference is not a valid File');
        }
    };

    const createFile = function (uint8Array, contentType, name) {
        const file = new File([uint8Array], name, {type: contentType});
        return file;
    };

    const readFile = async function (file) {
        validateFile(file);
        const response = new Response(file);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    };

    const downloadFile = function (file, overriddenFileName) {
        validateFile(file);
        validateCanDownload();
        const url = URL.createObjectURL(file);
        const downloadElement = document.createElement('a');
        document.body.appendChild(downloadElement);

        const name = overriddenFileName === '' ? file.name : overriddenFileName;
        downloadElement.download = name;
        downloadElement.href = url;
        downloadElement.rel = 'noopener';

        downloadElement.click();
        document.body.removeChild(downloadElement);
        URL.revokeObjectURL(url);
    };

    const getFileMetadata = function (file) {
        validateFile(file);
        const fileMetadata = {name: file.name};
        const fileMetadataJSON = JSON.stringify(fileMetadata);
        return fileMetadataJSON;
    };

    window.WebVIFile = {
        createFile,
        readFile,
        downloadFile,
        getFileMetadata
    };
}());
