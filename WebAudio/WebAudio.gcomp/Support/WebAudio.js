(function () {
    'use strict';

    // Helpers
    const getAudioContext = (function () {
        // Create a single AudioContext for the page
        // https://developers.google.com/web/updates/2012/01/Web-Audio-FAQ#q_how_many_audio_contexts_should_i_have
        let audioContext;
        return function () {
            if (audioContext === undefined) {
                audioContext = new AudioContext();
            }
            return audioContext;
        };
    }());

    // Buffers
    const decodeAudioDataFromArrayBuffer = async function (arrayBuffer) {
        const audioContext = getAudioContext();
        return new Promise((resolve, reject) => {
            audioContext.decodeAudioData(arrayBuffer, resolve, reject);
        });
    };

    const createAudioBufferFromUrl = async function (url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        // AudioBuffer adopts ArrayBuffer, so no point making it external
        const audioBuffer = await decodeAudioDataFromArrayBuffer(arrayBuffer);
        return audioBuffer;
    };

    const playAudioBuffer = function (audioBuffer, destination) {
        const audioContext = getAudioContext();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(destination);
        source.start();
    };

    // AudioNodes
    const validateAudioNode = function (source) {
        if (source instanceof AudioNode === false) {
            throw new Error('Expected a valid AudioNode.');
        }
    };

    const createMediaStreamAudioSourceNode = async function () {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioContext = getAudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        return mediaStreamAudioSourceNode;
    };

    const getAudioDestinationNode = function () {
        const audioContext = getAudioContext();
        const audioDestinationNode = audioContext.destination;
        return audioDestinationNode;
    };

    // Analyser
    class Analyser {
        constructor (source) {
            const audioContext = getAudioContext();
            const analyser = audioContext.createAnalyser();
            this._analyser = analyser;
            this._floatTimeDomainData = new Float32Array(analyser.fftSize);
            this._floatFrequencyData = new Float32Array(analyser.frequencyBinCount);
            source.connect(analyser);
        }

        getFloatTimeDomainData () {
            this._analyser.getFloatTimeDomainData(this._floatTimeDomainData);
            return this._floatTimeDomainData;
        }

        getFloatFrequencyData () {
            this._analyser.getFloatFrequencyData(this._floatFrequencyData);
            return this._floatFrequencyData;
        }
    }

    const validateAnalyser = function (analyser) {
        if (analyser instanceof Analyser === false) {
            throw new Error('Expected a valid Analyser.');
        }
    };

    const createAnalyser = function (source) {
        validateAudioNode(source);
        const analyser = new Analyser(source);
        return analyser;
    };

    const getFloatTimeDomainData = function (analyser) {
        validateAnalyser(analyser);
        const floatTimeDomainData = analyser.getFloatTimeDomainData();
        return floatTimeDomainData;
    };

    const getFloatFrequencyData = function (analyser) {
        validateAnalyser(analyser);
        const floatFrequencyData = analyser.getFloatFrequencyData();
        return floatFrequencyData;
    };

    // AudioContextState
    const getSampleRate = function () {
        const audioContext = getAudioContext();
        return audioContext.sampleRate;
    };

    window.WebVIWebAudio = {
        // Buffers
        createAudioBufferFromUrl,
        playAudioBuffer,
        // AudioNodes
        createMediaStreamAudioSourceNode,
        getAudioDestinationNode,
        // Analyser
        createAnalyser,
        getFloatTimeDomainData,
        getFloatFrequencyData,
        // AudioContextState
        getSampleRate
    };
}());
