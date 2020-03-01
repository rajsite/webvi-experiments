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

    class ReferenceManager {
        constructor () {
            this._nextReference = 1;
            this.references = new Map();
        }

        createReference (obj) {
            const reference = this._nextReference;
            this._nextReference += 1;
            this.references.set(reference, obj);
            return reference;
        }

        getObject (reference) {
            return this.references.get(reference);
        }

        closeReference (reference) {
            this.references.delete(reference);
        }
    }
    const referenceManager = new ReferenceManager();

    // Sources
    const createMediaStreamAudioSourceNode = async function () {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioContext = getAudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        const mediaStreamAudioSourceNodeReference = referenceManager.createReference(mediaStreamAudioSourceNode);
        return mediaStreamAudioSourceNodeReference;
    };

    // AudioNodes
    const validateAudioNode = function (sourceReference) {
        const source = referenceManager.getObject(sourceReference);
        if (source instanceof AudioNode === false) {
            throw new Error('Expected a valid AudioNode.');
        }
        return source;
    };

    class Analyser {
        constructor (source) {
            const audioContext = getAudioContext();
            const analyser = audioContext.createAnalyser();
            this.analyser = analyser;
            this.floatTimeDomainData = new Float32Array(analyser.fftSize);
            this.floatFrequencyData = new Float32Array(analyser.frequencyBinCount);
            source.connect(analyser);
        }

        getFloatTimeDomainData () {
            this.analyser.getFloatTimeDomainData(this.floatTimeDomainData);
            return this.floatTimeDomainData;
        }

        getFloatFrequencyData () {
            this.analyser.getFloatFrequencyData(this.floatFrequencyData);
            return this.floatFrequencyData;
        }
    }

    const validateAnalyser = function (analyserReference) {
        const analyser = referenceManager.getObject(analyserReference);
        if (analyser instanceof Analyser === false) {
            throw new Error('Expected a valid Analyser.');
        }
        return analyser;
    };

    const createAnalyser = function (sourceReference) {
        const source = validateAudioNode(sourceReference);
        const analyser = new Analyser(source);
        const analyserReference = referenceManager.createReference(analyser);
        return analyserReference;
    };

    const getFloatTimeDomainData = function (analyserReference) {
        const analyser = validateAnalyser(analyserReference);
        const floatTimeDomainData = analyser.getFloatTimeDomainData();
        return floatTimeDomainData;
    };

    const getFloatFrequencyData = function (analyserReference) {
        const analyser = validateAnalyser(analyserReference);
        const floatFrequencyData = analyser.getFloatFrequencyData();
        return floatFrequencyData;
    };

    window.WebVIWebAudio = {
        createMediaStreamAudioSourceNode,
        createAnalyser,
        getFloatTimeDomainData,
        getFloatFrequencyData
    };
}());
