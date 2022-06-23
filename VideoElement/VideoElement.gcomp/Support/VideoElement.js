(function () {
    'use strict';

    const create = function (placeholder, source) {
        const videoElement = document.createElement('video');
        videoElement.style.height = '100%';
        videoElement.style.width = '100%';
        videoElement.src = source;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.controls = true;
        placeholder.append(videoElement);
    };

    window.WebVIVideoElement = {
        create
    };
}());
