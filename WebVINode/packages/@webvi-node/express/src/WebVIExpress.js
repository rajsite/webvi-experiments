(function () {
    'use strict';

    // Current instancing strategy
    // A single node.js process is started
    // For each endpoint a vireo instance is eagerly created with the via for the instance
    // Each endpoint has a resource pool with a single vireo instance
    // Requests to a specific endpoint are blocked based on the single vireo instance pool
    // The top-level VI is enqueued when an endpoint is run. The VI is not rebooted so state persists between executions of an endpoint per endpoint.
    // The ReferenceManager is shared across all instances so need to be careful about references shared between instances (none yet?)

    // node imports
    const fs = require('fs');
    const path = require('path');
    const process = require('process');

    // webvicli imports
    const {glob, htmlRequire, sharedReferenceManager} = require('webvicli');

    // webvicli-express imports
    const express = require('express');
    const createVireoMiddleware = require('./createVireoMiddleware.js');

    const runExpressApplication = async function (serverPath, clientPath) {
        console.log('Searching for routes');
        const viaPaths = glob.sync('**/@(get|post|put|all).via.txt', {cwd: serverPath});
        const endpointConfigs = viaPaths.map(function (viaPath) {
            const {dir, name} = path.parse(viaPath);

            const method = name.substring(0, name.indexOf('.'));
            const route = '/' + dir;
            const viaWithEnqueue = fs.readFileSync(viaPath, 'utf8');
            const htmlFileName = `${dir}/${method}.html`;
            const htmlPath = path.join(serverPath, htmlFileName);

            return {method, route, viaWithEnqueue, htmlPath};
        });
        console.log('Finished searching for routes.');
        console.log('Discovered endpoints:');
        endpointConfigs.forEach(endpointConfig => console.log(`${endpointConfig.route} - ${endpointConfig.method}`));

        console.log('Loading route html require dependencies');
        endpointConfigs.forEach(endpointConfig => htmlRequire(endpointConfig.htmlPath));
        console.log('Finished loading route html require dependencies');

        console.log('Configuring express');
        const app = express();

        console.log('Configuring express vireo middleware');
        endpointConfigs.forEach(function (endpointConfig) {
            const {method, route, viaWithEnqueue} = endpointConfig;
            app[method](route, createVireoMiddleware({viaWithEnqueue}));
        });

        // TODO should just make a path.resolve node that is user facing instead
        const staticAssets = path.normalize(clientPath);
        console.log('Configuring express static folder: ' + staticAssets);
        app.use(express.static(staticAssets));

        const defaultPort = 3000;
        const port = process.env.PORT || defaultPort;
        app.listen(port, () => console.log(`Example app listening on port ${port}!`));

        console.log('Discovered Routes:');
        endpointConfigs.forEach(endpointConfig => console.log(`${endpointConfig.route} - ${endpointConfig.method}`));
    };

    const writeJSONResponse = function (server, jsonResponse) {
        const {res} = sharedReferenceManager.getObject(server);
        res.json(JSON.parse(jsonResponse));
    };

    module.exports = {
        runExpressApplication,
        writeJSONResponse
    };
}());
