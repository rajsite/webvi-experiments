(function () {
    'use strict';
    const browser = window.browser || window.chrome;

    class DataQueue {
        constructor () {
            this.queue = [];
            this.pendingResolve = undefined;
            this.pendingReject = undefined;
        }

        enqueue (data) {
            if (this.queue === undefined) {
                throw new Error(`The queue has already been destroyed, cannot enqueue new data: ${data}`);
            }

            this.queue.push(data);

            if (this.pendingResolve !== undefined) {
                this.pendingResolve(this.queue.shift());
                this.pendingResolve = undefined;
                this.pendingReject = undefined;
            }
        }

        dequeue () {
            if (this.queue === undefined) {
                throw new Error('The queue has already been destroyed, cannot dequeue any data.');
            }

            if (this.pendingResolve !== undefined) {
                throw new Error('A pending dequeue operation already exists. Only one pending dequeue operation allowed at a time.');
            }

            if (this.queue.length === 0) {
                return new Promise((resolve, reject) => {
                    this.pendingResolve = resolve;
                    this.pendingReject = reject;
                });
            }

            return this.queue.shift();
        }

        destroy () {
            if (this.pendingResolve !== undefined) {
                this.pendingReject(new Error('Pending dequeue operation failed due to queue destruction.'));
                this.pendingResolve = undefined;
                this.pendingReject = undefined;
            }
            this.pendingResolve = undefined;

            const remaining = this.queue;
            this.queue = undefined;
            return remaining;
        }
    }

    class WebVIDevToolsEventManager {
        constructor () {
            this._queue = new DataQueue();
            this._handler = (eventData) => {
                if (typeof eventData === 'string') {
                    this._queue.enqueue(eventData);
                }
            };
            browser.runtime.onMessage.addListener(this._handler);
        }

        read () {
            return this._queue.dequeue();
        }

        stop () {
            browser.runtime.onMessage.removeListener(this._handler);
            this._handler = undefined;
            this._queue.destroy();
            this._queue = undefined;
        }
    }

    const eventManager = new WebVIDevToolsEventManager();
    const waitForEvent = async function () {
        const eventData = await eventManager.read();
        return eventData;
    };

    window.WebVIDevTools = {waitForEvent};
}());
