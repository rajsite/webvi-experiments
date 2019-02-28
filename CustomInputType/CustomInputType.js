(function () {
    'use strict';

    class DataQueue {
        constructor () {
            this._queue = [];
            this._pendingResolve = undefined;
            this._pendingReject = undefined;
        }

        _clearPending () {
            this._pendingResolve = undefined;
            this._pendingReject = undefined;
        }

        enqueue (data) {
            if (this._queue === undefined) {
                throw new Error(`The queue has already been destroyed, cannot enqueue new data: ${data}`);
            }

            this._queue.push(data);

            if (this._pendingResolve !== undefined) {
                const pendingResolve = this._pendingResolve;
                this._clearPending();
                pendingResolve(this._queue.shift());
            }
        }

        dequeue () {
            if (this._queue === undefined) {
                throw new Error('The queue has already been destroyed, cannot dequeue any data.');
            }

            if (this._pendingResolve !== undefined) {
                throw new Error('A pending dequeue operation already exists. Only one pending dequeue operation allowed at a time.');
            }

            if (this._queue.length === 0) {
                return new Promise((resolve, reject) => {
                    this._pendingResolve = resolve;
                    this._pendingReject = reject;
                });
            }

            return this._queue.shift();
        }

        destroy () {
            const remaining = this._queue;
            this._queue = undefined;

            if (this._pendingResolve !== undefined) {
                const toReject = this._pendingReject;
                this._clearPending();
                toReject(new Error('Pending dequeue operation failed due to queue destruction.'));
            }

            return remaining;
        }
    }

    let nextRefnum = 1;
    class RefnumManager {
        constructor () {
            this.refnums = new Map();
        }

        createRefnum (obj) {
            const refnum = nextRefnum;
            nextRefnum += 1;
            this.refnums.set(refnum, obj);
            return refnum;
        }

        getObject (refnum) {
            return this.refnums.get(refnum);
        }

        closeRefnum (refnum) {
            this.refnums.delete(refnum);
        }
    }
    const refnumManager = new RefnumManager();

    const createCustomInputType = function (selector, attributesJSON) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find exactly one element with selector: ${selector}, but instead found: ${elements.length}`);
        }

        const element = elements[0];
        const refnum = refnumManager.createRefnum({
            element,
            handler
        });
    };

    window.customInputType = {
        createCustomInputType
    };
}());
