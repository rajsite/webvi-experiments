(function () {
    'use strict';

    const arModel;

    window.replaceUI = function (textSelector, jsAPI) {
        var cb = jsAPI.getCompletionCallback();
    
        var textSelector = document.querySelector(textSelector);
        textSelector.innerHTML = '';
        var arFrame = document.createElement('iframe');
        arFrame.style = 'width: 100%; height: 100%';
        arFrame.src = 'AugmentedRealityFrame.html';
        arFrame.addEventListener('load', function () {
            arModel = arFrame.contentDocument.querySelector('a-gltf-model');
            cb();
        });
        textSelector.appendChild(arFrame);
    };

    window.setModelHeight = function (newHeight) {
        if (arModel !== undefined) {
            arModel.object3D.position.y = newHeight;
        }
    };

}());
