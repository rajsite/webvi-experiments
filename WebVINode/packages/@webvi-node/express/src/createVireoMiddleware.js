(function () {
    'use strict';

    const {performance} = require('perf_hooks');
    const genericPool = require('generic-pool');
    const {VireoNode} = require('@webvi-node/runner');

    class VireoMiddleware {
        constructor (viaWithEnqueue, customGlobal) {
            this._vireoNode = new VireoNode(viaWithEnqueue, customGlobal);
            this._serverValueRef = undefined;
        }
        async initialize () {
            await this._vireoNode.initialize();
            const vireo = this._vireoNode.vireoInstance;
            const viName = this._vireoNode.getVIName();
            this._serverValueRef = vireo.eggShell.findValueRef(viName, 'dataItem_Server');
        }
        async runRequest ({req, res}) {
            const vireo = this._vireoNode.vireoInstance;
            try {
                // enqueue needs to be called before writing to memory? seems to reset values if after..
                this._vireoNode.enqueueVI();
                vireo.eggShell.writeJavaScriptRefNum(this._serverValueRef, {req, res});
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
                const vireoMiddleware = new VireoMiddleware(viaWithEnqueue, customGlobal);
                await vireoMiddleware.initialize();
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
                    await vireoMiddleware.runRequest({req, res});
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
