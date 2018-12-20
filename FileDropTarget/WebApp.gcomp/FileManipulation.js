(function () {
    'use strict';

    const makeAsync = function (jsapi, asyncFn) {
        const completionCallback = jsapi.getCompletionCallback();
        asyncFn().then(completionCallback).catch(completionCallback);
    };

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
    }

    const readFile = async function (file) {
        return new Promise(function (resolve, reject) {
            const loadendHandler = function () {
                fileReader.removeEventListener('loadend', loadendHandler);
                if (fileReader.error) {
                    reject(fileReader.error);
                } else {
                    const result = new Uint8Array(fileReader.result);
                    resolve(result);
                }
            }

            const fileReader = new FileReader();
            fileReader.addEventListener('loadend', loadendHandler);
            fileReader.readAsArrayBuffer(file);
        });
    }

    const loadFileFromDropTarget = function (selector, jsapi) {
        makeAsync(jsapi, async function () {
            const dropTargets = document.querySelectorAll(selector);
            if (dropTargets.length !== 1) {
                throw new Error(`Expected only one drop target, instead found ${dropTargets.length} using selector ${selector}`);
            }
            const dropTarget = dropTargets[0];
            const files = await filesDropOnTarget(dropTarget);
            if (files.length !== 1) {
                throw new Error(`Expected one file to be dropped on target, instead found ${files.length} files using drop target with selector ${selector}`);
            }
            return await readFile(files[0]);
        });
    };

    const createObjectUrlFromArray = function (uint8Array, contentTypeIn) {
        const contentType = contentTypeIn || 'text/plain';
        const blob = new Blob([uint8Array.buffer], {type: contentType});
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
    };

    const revokeObjectUrl = function (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
    };

    window.webviFileManipulation = {};
    window.webviFileManipulation.loadFileFromDropTarget = loadFileFromDropTarget;
    window.webviFileManipulation.createObjectUrlFromArray = createObjectUrlFromArray;
    window.webviFileManipulation.revokeObjectUrl = revokeObjectUrl;
}());
