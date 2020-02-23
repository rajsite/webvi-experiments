(function () {
    'use strict';

    let timeData;
    let timeCallback;
    let fftData;
    let fftCallback;

    const start = async function () {
        let stream = await navigator.mediaDevices.getUserMedia({audio: true});

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        timeData = new Float32Array(analyser.fftSize);
        fftData = new Float32Array(analyser.frequencyBinCount);
        source.connect(analyser);

        // Concerned more about keeping UI performant, okay with missing samples
        requestAnimationFrame(function collectData () {
            if (timeCallback !== undefined && fftCallback !== undefined) {
                analyser.getFloatTimeDomainData(timeData);
                analyser.getFloatFrequencyData(fftData);
                timeCallback(timeData);
                fftCallback(fftData);
                timeCallback = fftCallback = undefined;
            }
            requestAnimationFrame(collectData);
        });
    };

    window.runStart = function (jsAPI) {
        let cb = jsAPI.getCompletionCallback();
        start().then(cb, cb);
    };

    window.getData = function (jsAPI) {
        timeCallback = jsAPI.getCompletionCallback();
    };

    window.getFFT = function (jsAPI) {
        fftCallback = jsAPI.getCompletionCallback();
    };
}());
