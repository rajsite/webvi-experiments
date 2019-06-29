(function () {
    'use strict';

    const encodeAsBase64 = function (byteArray) {
        const binaryString = String.fromCharCode.apply(undefined, byteArray);
        const base64EncodedString = btoa(binaryString);
        return base64EncodedString;
    };

    const decodeFromBase64 = function (base64EncodedString) {
        const binaryString = atob(base64EncodedString);
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < byteArray.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray;
    };

    window.WebVIBase64 = {
        encodeAsBase64,
        decodeFromBase64
    };
}());
