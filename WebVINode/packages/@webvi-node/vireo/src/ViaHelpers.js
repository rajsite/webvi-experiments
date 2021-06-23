(function () {
    'use strict';

    class ViaHelpers {
        constructor (viaWithEnqueue) {
            const enqueueRegex = /^enqueue\s*\((\S*)\)$/m;
            this._via = viaWithEnqueue.replace(enqueueRegex, '');
            this._viName = viaWithEnqueue.match(enqueueRegex)[1];
        }

        get via () {
            return this._via;
        }

        get viName () {
            return this._viName;
        }

        get enqueueInstruction () {
            return `enqueue(${this._viName})`;
        }
    }

    module.exports = ViaHelpers;
}());
