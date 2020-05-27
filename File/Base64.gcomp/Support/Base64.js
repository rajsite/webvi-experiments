(function () {
    'use strict';

    const encode = function (data) {
        const binaryString = String.fromCharCode.apply(undefined, data);
        const encodedData = btoa(binaryString);
        return encodedData;
    };

    const decode = function (encodedData) {
        const binaryString = atob(encodedData);
        const data = new Uint8Array(binaryString.length);
        for (let i = 0; i < data.length; i++) {
            data[i] = binaryString.charCodeAt(i);
        }
        return data;
    };

    window.WebVIBase64 = {
        encode,
        decode
    };
}());
