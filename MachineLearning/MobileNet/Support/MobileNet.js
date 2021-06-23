(function () {
    'use strict';

    const imageLoad = function (img, src) {
        return new Promise(function (resolve) {
            const loadHandler = function () {
                img.removeEventListener('load', loadHandler);
                resolve();
            };
            img.addEventListener('load', loadHandler);
            img.src = src;
        });
    };

    const helperImage = document.createElement('img');
    const load = async function () {
        const model = await window.mobilenet.load();
        return model;
    };
    const classify = async function (model, fileReference) {
        const src = URL.createObjectURL(fileReference);
        await imageLoad(helperImage, src);
        const results = await model.classify(helperImage);
        const resultsJSON = JSON.stringify(results);
        URL.revokeObjectURL(src);
        return resultsJSON;
    };
    window.WebVIMobileNet = {
        load,
        classify
    };
}());
