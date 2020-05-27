(function () {
    'use strict';

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
        if ('download' in HTMLAnchorElement.prototype === false) {
            throw new Error('Browser does not support anchor download attribute, unable to trigger download');
        }
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

    const createFileUrl = function (file) {
        validateFile(file);
        const url = URL.createObjectURL(file);
        return url;
    };

    const getFileMetadata = function (file) {
        validateFile(file);
        const fileMetadata = {name: file.name};
        const fileMetadataJSON = JSON.stringify(fileMetadata);
        return fileMetadataJSON;
    };

    window.WebVIFileApi = {
        createFile,
        readFile,
        downloadFile,
        createFileUrl,
        getFileMetadata
    };
}());
