(function () {
    'use strict';
    const create = function (container) {
        const videoElement = document.createElement('video');
        videoElement.style.height = '100%';
        videoElement.style.width = '100%';
        videoElement.muted = true;
        videoElement.classList.add('video-js');
        container.appendChild(videoElement);
        return new Promise(resolve => {
            const player = window.videojs(videoElement, {});
            player.ready(() => {
                resolve(player);
            });
        });
    };

    const src = function (player, url) {
        player.src(url);
    };

    const play = function (player) {
        player.play();
    };

    const dispose = function (player) {
        player.dispose();
    };

    window.WebVIVideoJS = {create, src, play, dispose};
}());
