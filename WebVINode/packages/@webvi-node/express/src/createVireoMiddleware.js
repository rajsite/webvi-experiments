(function () {
    'use strict';

    const {performance} = require('perf_hooks');
    const genericPool = require('generic-pool');
    const VireoNode = require('@webvi-node/vireo');

    class VireoMiddleware {
        constructor () {
            this._vireo = undefined;
            this._serverValueRef = undefined;
        }

        async initialize (viaWithEnqueue, customGlobal) {
            const vireo = await VireoNode.createInstance(customGlobal);
            const viaHelpers = VireoNode.createViaHelpers(viaWithEnqueue);
            vireo.eggShell.loadVia(viaHelpers.via);
            this._serverValueRef = vireo.eggShell.findValueRef(viaHelpers.viName, 'dataItem_Server');
            this._vireo = vireo;
            this._viaHelpers = viaHelpers;
        }

        async runRequest (server) {
            const vireo = this._vireo;
            const viaHelpers = this._viaHelpers;
            try {
                // enqueue needs to be called before writing to memory (resets values if after)
                vireo.eggShell.loadVia(viaHelpers.enqueueInstruction);
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
