(function () {
    'use strict';

    var arModel;

    window.replaceUI = function (textSelector, jsAPI) {
        var cb = jsAPI.getCompletionCallback();
    
        var textSelector = document.querySelector(textSelector);
        textSelector.innerHTML = '';
        textSelector.classList.add('augmented-reality-initialized');
        var arFrame = document.createElement('iframe');
        arFrame.style = 'width: 100%; height: 100%';
        arFrame.src = 'AugmentedReality/AugmentedReality.html';
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
