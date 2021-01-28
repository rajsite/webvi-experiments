import {AudioContext} from './dist/bundle.js';

// Create a single AudioContext for the page
// https://developers.google.com/web/updates/2012/01/Web-Audio-FAQ#q_how_many_audio_contexts_should_i_have
const audioContextPromise = new Promise(function (resolve) {
    document.addEventListener('click', function createAudioContext () {
        document.removeEventListener('click', createAudioContext);
        const audioContext = new AudioContext();
        resolve(audioContext);
    });
});

// Helpers
const getAudioContext = async function () {
    return await audioContextPromise;
};

// Buffers
const decodeAudioDataFromArrayBuffer = async function (arrayBuffer) {
    const audioContext = await getAudioContext();
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

const playAudioBuffer = async function (audioBuffer, destination) {
    const audioContext = await getAudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(destination);
    source.start();
};

// AudioNodes
const createMediaStreamAudioSourceNode = async function () {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const audioContext = await getAudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    return mediaStreamAudioSourceNode;
};

const getAudioDestinationNode = async function () {
    const audioContext = await getAudioContext();
    const audioDestinationNode = audioContext.destination;
    return audioDestinationNode;
};

// Analyser
class Analyser {
    async init (source) {
        const audioContext = await getAudioContext();
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

const createAnalyser = async function (source) {
    const analyser = new Analyser();
    await analyser.init(source);
    return analyser;
};

const getFloatTimeDomainData = function (analyser) {
    const floatTimeDomainData = analyser.getFloatTimeDomainData();
    return floatTimeDomainData;
};

const getFloatFrequencyData = function (analyser) {
    const floatFrequencyData = analyser.getFloatFrequencyData();
    return floatFrequencyData;
};

// AudioContextState
const getSampleRate = async function () {
    const audioContext = await getAudioContext();
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
