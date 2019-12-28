(function () {
    'use strict';

    const {VireoNode} = require('@webvi-node/runner');

    class VireoMiddlewareRuntime {
        constructor () {
            this._vireoNode = undefined;
            this._serverValueRef = undefined;
        }
        async initialize (viaWithEnqueue) {
            const vireoNode = new VireoNode(viaWithEnqueue);
            await vireoNode.initialize();
            const viName = vireoNode.getVIName();
            const serverValueRef = vireoNode.vireo.eggShell.findValueRef(viName, 'dataItem_Server');

            this._vireoNode = vireoNode;
            this._serverValueRef = serverValueRef;
        }

        get serverValueRef () {
            return this._serverValueRef;
        }

        get vireoNode () {
            return this._vireoNode;
        }
    }

    module.exports = VireoMiddlewareRuntime;
}());
