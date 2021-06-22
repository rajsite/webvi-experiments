(function () {
    'use strict';
    window.WebVILoadScene = async function () {
        const response = await window.fetch('./scene1.bin');
        const buffer = await response.arrayBuffer();
        const typedArray = new Uint8Array(buffer);
        return typedArray;
    };
}());
