(function () {
    'use strict';

    // node imports
    const {performance} = require('perf_hooks');

    // webvicli imports
    const webvicli = require('webvicli');
    const sharedReferenceManager = webvicli.sharedReferenceManager;

    // webvicli-express imports
    const genericPool = require('generic-pool');
    const VireoMiddlewareRuntime = require('./VireoMiddlewareRuntime.js');

    const createVireoMiddleware = function ({viaWithEnqueue}) {
        const create = async function () {
            try {
                console.log('making vireo instance');
                const vireoMiddlewareRuntime = new VireoMiddlewareRuntime();
                await vireoMiddlewareRuntime.initialize(viaWithEnqueue);
                return vireoMiddlewareRuntime;
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
                let vireoMiddlewareRuntime;
                let serverReference;
                try {
                    vireoMiddlewareRuntime = await pool.acquire();
                    serverReference = sharedReferenceManager.createReference({req, res});
                    const {serverValueRef, vireoNode} = vireoMiddlewareRuntime;
                    // enqueue needs to be called before writing to memory? seems to reset values if after..
                    vireoNode.enqueueVI();
                    vireoNode.vireo.eggShell.writeDouble(serverValueRef, serverReference);
                    await vireoNode.vireo.eggShell.executeSlicesUntilClumpsFinished();
                } catch (ex) {
                    console.error(ex);
                    pool.destroy(vireoMiddlewareRuntime);
                    throw ex;
                } finally {
                    sharedReferenceManager.closeReference(serverReference);
                    pool.release(vireoMiddlewareRuntime);
                    console.log(`Request took ${performance.now() - start}ms`);
                }
            }()).catch(ex => next(ex));
        };
        return runVireoMiddleware;
    };

    module.exports = createVireoMiddleware;
}());
