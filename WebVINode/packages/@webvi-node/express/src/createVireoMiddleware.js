(function () {
    'use strict';

    const {performance} = require('perf_hooks');
    const genericPool = require('generic-pool');
    const {VireoNode} = require('@webvi-node/runner');

    class VireoMiddleware {
        constructor () {
            this._vireoNode = new VireoNode();
            this._serverValueRef = undefined;
        }
        async initialize (viaWithEnqueue, customGlobal) {
            const vireo = await this._vireoNode.initialize(viaWithEnqueue, customGlobal);
            this._serverValueRef = vireo.eggShell.findValueRef(this._vireoNode.viName, 'dataItem_Server');
        }
        async runRequest (server) {
            const vireo = this._vireoNode.vireoInstance;
            try {
                // enqueue needs to be called before writing to memory (resets values if after)
                this._vireoNode.enqueueVI();
                vireo.eggShell.writeJavaScriptRefNum(this._serverValueRef, server);
                await vireo.eggShell.executeSlicesUntilClumpsFinished();
            } finally {
                vireo.eggShell.clearJavaScriptRefNum(this._serverValueRef);
            }
        }
    }

    const createVireoMiddleware = function (viaWithEnqueue, customGlobal) {
        const create = async function () {
            try {
                console.log('making vireo instance');
                const vireoMiddleware = new VireoMiddleware();
                await vireoMiddleware.initialize(viaWithEnqueue, customGlobal);
                return vireoMiddleware;
            } catch (ex) {
                console.error('Failed to create vireo middleware instance');
                console.error(ex);
                throw ex;
            }
        };
        const destroy = function () {
            return undefined;
        };
        const pool = genericPool.createPool({create, destroy}, {max: 1, min: 1});
        // TODO implement the pool create error functionality
        // TODO warmup pool by acquiring and releasing vireo?
        // TODO enable lazy instantiation with autoStart false?

        const runVireoMiddleware = function (req, res, next) {
            (async function () {
                // TODO listen for req.on('close') to cancel the current vireo execution. Need to figure out a cleanup strategy in that case.
                const start = performance.now();
                let vireoMiddleware;
                try {
                    vireoMiddleware = await pool.acquire();
                    const server = {req, res};
                    await vireoMiddleware.runRequest(server);
                } catch (ex) {
                    console.error(ex);
                    pool.destroy(vireoMiddleware);
                    throw ex;
                } finally {
                    pool.release(vireoMiddleware);
                    console.log(`Request took ${performance.now() - start}ms`);
                }
            }()).then(() => next()).catch(ex => next(ex));
        };
        return runVireoMiddleware;
    };

    module.exports = createVireoMiddleware;
}());
