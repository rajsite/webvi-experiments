(function () {
    'use strict';

    const validateVideoElement = function (element) {
        if (element instanceof HTMLVideoElement === false) {
            throw new Error('Input is not a valid HTMLVideoElement');
        }
    };

    const validateEventStreamReader = function (eventStreamReader) {
        // NXG 5 does not include the ReadableStreamDefaultReader in the global scope so skip validation
        if (window.ReadableStreamDefaultReader === undefined) {
            return;
        }
        if (eventStreamReader instanceof window.ReadableStreamDefaultReader === false) {
            throw new Error('Input is not a valid event stream reader');
        }
    };

    const create = function (placeholder, source) {
        const videoElement = document.createElement('video');
        videoElement.style.height = '100%';
        videoElement.style.width = '100%';
        videoElement.src = source;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.controls = true;
        placeholder.append(videoElement);
        return videoElement;
    };

    const destroy = function (videoElement) {
        validateVideoElement(videoElement);
        videoElement.parentNode.removeChild(videoElement);
    };

    const addEventListener = function (videoElement) {
        validateVideoElement(videoElement);
        let changeHandler;
        const eventStream = new ReadableStream({
            start (controller) {
                changeHandler = (e) => {
                    const value = e.target.currentTime;
                    controller.enqueue(value);
                };
                videoElement.addEventListener('timeupdate', changeHandler);
            },
            cancel () {
                videoElement.removeEventListener('timeupdate', changeHandler);
            }
        });
        const eventStreamReader = eventStream.getReader();
        return eventStreamReader;
    };

    const waitForEvent = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        const {value, done} = await eventStreamReader.read();
        if (done) {
            throw new Error('Video Event Listener removed');
        }
        return value;
    };

    const removeEventListener = async function (eventStreamReader) {
        validateEventStreamReader(eventStreamReader);
        await eventStreamReader.cancel();
    };

    window.WebVIVideoElement = {
        create,
        destroy,
        addEventListener,
        waitForEvent,
        removeEventListener
    };
}());
