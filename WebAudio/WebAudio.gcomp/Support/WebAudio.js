(function () {
    'use strict';

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

    // Sources
    const createMediaStreamAudioSourceNode = async function () {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioContext = getAudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        return mediaStreamAudioSourceNode;
    };

    // AudioNodes
    const validateAudioNode = function (source) {
        if (source instanceof AudioNode === false) {
            throw new Error('Expected a valid AudioNode.');
        }
    };

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

    const getSampleRate = function () {
        const audioContext = getAudioContext();
        return audioContext.sampleRate;
    };

    window.WebVIWebAudio = {
        createMediaStreamAudioSourceNode,
        createAnalyser,
        getFloatTimeDomainData,
        getFloatFrequencyData,
        getSampleRate
    };
}());
