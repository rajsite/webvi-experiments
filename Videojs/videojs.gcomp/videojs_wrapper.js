(function () {
    'use strict';

    window.playVideoHttpStreaming = function (selector, src, type) {
        const el = document.querySelector(selector);

        el.innerHTML = `<video autoplay muted style="height:100%;width:100%;"></video>`;
        const videoElement = el.firstElementChild;
        const player = window.videojs(videoElement, {
            // fill: true
        });

        player.src({
            src,
            type
        });

        player.play();
    };
}());
