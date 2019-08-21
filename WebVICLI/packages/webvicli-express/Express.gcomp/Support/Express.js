(function () {
    'use strict';

    // Current instancing strategy
    // A single node.js process is started
    // For each endpoint a vireo instance is eagerly created with the via for the instance
    // Each endpoint has a resource pool with a single vireo instance
    // Requests to a specific endpoint are blocked based on the single vireo instance pool
    // The top-level VI is enqueued when an endpoint is run. The VI is not rebooted so state persists between executions of an endpoint per endpoint.
    // The ReferenceManager is shared across all instances so need to be careful about references shared between instances (none yet?)

    const fs = require('fs');
    const path = require('path');
    const express = require('express');
    const {performance} = require('perf_hooks');
    const genericPool = require('generic-pool');
    const glob = require('glob');
    const webvicli = require('webvicli');
    const referenceManager = webvicli.getReferenceManager();
    const componentPath = webvicli.getComponentPath();
    const clientPath = webvicli.getClientPath();
    const VireoNode = webvicli.VireoNode;

    const runExpressApplication = async function () {
        console.log('Searching for routes and initializing runtime instances...');
        const allViaPaths = glob.sync('**/*.via.txt', {cwd: componentPath});
        const viaPathRegex = /(get|post|put|all)\.via\.txt$/;
        const viaPaths = allViaPaths.filter(viaPath => viaPath.match(viaPathRegex) !== null);
        const endpointConfigs = await Promise.all(viaPaths.map(async function (viaPath) {
            const match = viaPath.match(viaPathRegex);
            const route = '/' + viaPath.substring(0, match.index);
            const method = match[1];
            const viaWithEnqueue = fs.readFileSync(path.resolve(componentPath, viaPath), 'utf8');
            const vireoNode = new VireoNode(viaWithEnqueue);
            await vireoNode.initialize();
            const serverValueRef = vireoNode.vireo.eggShell.findValueRef(vireoNode.getVIName(), 'dataItem_Server');
            return {method, route, vireoNode, serverValueRef};
        }));
        console.log('Finished searching for routes and initializing runtime instances.');

        const createVireoMiddleware = function (vireoNode, serverValueRef) {
            const vireoPoolInstance = {vireoNode, serverValueRef};
            const pool = genericPool.createPool(
                {create: () => vireoPoolInstance, destroy: () => undefined},
                {max: 1, min: 1}
            );
            const runWebVI = async function (req, res) {
                // TODO listen for req.on('close') to cancel the current vireo execution. Need to figure out a cleanup strategy in that case.
                const start = performance.now();
                const vireoPoolInstance = await pool.acquire();
                const server = referenceManager.createReference({req, res});
                const {vireoNode, serverValueRef} = vireoPoolInstance;
                try {
                    // enqueue needs to be called before writing to memory? seems to reset values if after..
                    vireoNode.enqueueVI();
                    vireoNode.vireo.eggShell.writeDouble(serverValueRef, server);
                    await vireoNode.vireo.eggShell.executeSlicesUntilClumpsFinished();
                } catch (ex) {
                    console.error(ex);
                    // TODO discard crashed vireo instance
                } finally {
                    referenceManager.closeReference(server);
                    await pool.release(vireoPoolInstance);
                    console.log(`Request ${server} took ${performance.now() - start}ms`);
                }
            };
            return runWebVI;
        };
        console.log('Configuring express');
        const app = express();

        console.log('Configuring express vireo middleware');
        endpointConfigs.forEach(function (endpointConfig) {
            const {method, route, vireoNode, serverValueRef} = endpointConfig;
            app[method](route, createVireoMiddleware(vireoNode, serverValueRef));
        });

        console.log('Configuring express static folder');
        app.use(express.static(clientPath));

        const defaultPort = 3000;
        const port = process.env.PORT || defaultPort;
        app.listen(port, () => console.log(`Example app listening on port ${port}!`));

        console.log('Discovered Routes:');
        endpointConfigs.forEach(endpointConfig => console.log(`${endpointConfig.route} - ${endpointConfig.method}`));
    };

    const writeJSONResponse = function (server, jsonResponse) {
        const {res} = referenceManager.getObject(server);
        res.json(JSON.parse(jsonResponse));
    };

    global.WebVIExpress = {
        runExpressApplication,
        writeJSONResponse
    };
}());
