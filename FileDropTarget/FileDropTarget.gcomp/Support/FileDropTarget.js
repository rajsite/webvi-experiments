(function () {
    'use strict';

    const filesDropOnTarget = async function (dropTarget) {
        return new Promise(function (resolve) {
            const ignoreDefaultBehavior = function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            };

            const dropHandler = function (evt) {
                dropTarget.removeEventListener('dragenter', ignoreDefaultBehavior);
                dropTarget.removeEventListener('dragover', ignoreDefaultBehavior);
                dropTarget.removeEventListener('drop', dropHandler);
                ignoreDefaultBehavior(evt);
                resolve(evt.dataTransfer.files);
            };

            dropTarget.addEventListener('dragenter', ignoreDefaultBehavior);
            dropTarget.addEventListener('dragover', ignoreDefaultBehavior);
            dropTarget.addEventListener('drop', dropHandler);
        });
    };

    const loadFileFromDropTarget = async function (container) {
        const files = await filesDropOnTarget(container);
        if (files.length !== 1) {
            throw new Error(`Expected one file to be dropped on target, instead found ${files.length} files.`);
        }
        const [file] = files;
        const response = new Response(file);
        const arrayBuffer = await response.arrayBuffer();
        const fileContents = new Uint8Array(arrayBuffer);
        return fileContents;
    };

    const createObjectUrlFromArray = function (fileContents, contentType) {
        const contentTypeOrDefault = contentType || 'text/plain';
        const blob = new Blob([fileContents.buffer], {
            type: contentTypeOrDefault
        });
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
    };

    const revokeObjectUrl = function (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
    };

    window.WebVIFileDropTarget = {
        loadFileFromDropTarget,
        createObjectUrlFromArray,
        revokeObjectUrl
    };
}());
