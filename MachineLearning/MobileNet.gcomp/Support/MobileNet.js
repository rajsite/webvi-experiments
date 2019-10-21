(function () {
    'use strict';
    const load = async function () {
        await window.mobilenet.load();
    };
    window.WebVIMobileNet = {load};
}());
