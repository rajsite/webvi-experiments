(function () {
    'use strict';
    const browser = window.browser || window.chrome;

    let messageHandler;
    const eventStream = new ReadableStream({
        start (controller) {
            messageHandler = value => {
                if (typeof value === 'string') {
                    controller.enqueue(value);
                }
            };
            browser.runtime.onMessage.addListener(messageHandler);
        },
        cancel () {
            browser.runtime.onMessage.removeListener(messageHandler);
        }
    });
    const eventStreamReader = eventStream.getReader();

    const waitForEvent = async function () {
        const {value} = await eventStreamReader.read();
        const inspectPanelResultJSON = value;
        return inspectPanelResultJSON;
    };

    window.WebVIDevTools = {waitForEvent};
}());
