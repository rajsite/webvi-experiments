(function () {
    'use strict';

    // Current instancing strategy
    // A single node.js process is started
    // For each endpoint a vireo instance is eagerly created with the via for the instance
    // Each endpoint has a resource pool with a single vireo instance
    // Requests to a specific endpoint are blocked based on the single vireo instance pool
    // The top-level VI is enqueued when an endpoint is run. The VI is not rebooted so state persists between executions of an endpoint per endpoint.

    const fs = require('fs');
    const path = require('path');
    const process = require('process');
    const {htmlRequire} = require('@webvi-node/runner');
    const glob = require('glob');
    const express = require('express');
    const createVireoMiddleware = require('./createVireoMiddleware.js');

    class Endpoint {
        constructor (serverPath, relativeViaPath) {
            const {dir, name} = path.parse(relativeViaPath);

            this._method = name.substring(0, name.indexOf('.'));
            // TODO change to /blah/* so ids, etc can be handled in the request
            this._route = '/' + dir;
            this._viaWithEnqueue = fs.readFileSync(path.join(serverPath, relativeViaPath), 'utf8');
            const relativeHtmlFilePath = `${dir}/${this._method}.html`;
            this._htmlPath = path.join(serverPath, relativeHtmlFilePath);
            this._customGlobal = undefined;
        }

        loadDependencies () {
            const customGlobal = Object.create(global);
            const dependencies = htmlRequire(this._htmlPath);
            dependencies.forEach((dependency, globalName) => (customGlobal[globalName] = dependency));
            this._customGlobal = customGlobal;
        }

        createRoute (app) {
            if (this._customGlobal === undefined) {
                throw new Error('Load dependencies before using endpoint.');
            }
            app[this._method](this._route, express.text({type: '*/*'}), createVireoMiddleware(this._viaWithEnqueue, this._customGlobal));
        }

        get route () {
            return this._route;
        }

        get method () {
            return this._method;
        }
    }

    const runExpressApplication = async function (serverPath, clientPath) {
        console.log('Running express application');
        console.log(`server path: ${serverPath}`);
        console.log(`client path: ${clientPath}`);
        console.log('Searching for routes');
        const relativeViaPaths = glob.sync('**/@(get|post|put|all).via.txt', {cwd: serverPath});
        const endpoints = relativeViaPaths.map(relativeViaPath => new Endpoint(serverPath, relativeViaPath));

        console.log('Finished searching for routes.');
        console.log('Discovered endpoints:');
        endpoints.forEach(endpoint => console.log(`${endpoint.route} - ${endpoint.method}`));

        console.log('Loading route html require dependencies');
        endpoints.forEach(endpoint => endpoint.loadDependencies());
        console.log('Finished loading route html require dependencies');

        console.log('Configuring express');
        const app = express();

        console.log('Configuring express vireo middleware');
        endpoints.forEach(endpoint => endpoint.createRoute(app));

        // TODO should just make a path.resolve node that is user facing instead
        const staticAssets = path.normalize(clientPath);
        console.log('Configuring express static folder: ' + staticAssets);
        app.use(express.static(staticAssets));

        const defaultPort = 3000;
        const port = process.env.PORT || defaultPort;
        // Bind to 0.0.0.0 to avoid timeouts in heroku https://help.heroku.com/P1AVPANS/why-is-my-node-js-app-crashing-with-an-r10-error
        const host = '0.0.0.0';
        const options = {
            port,
            host
        };
        app.listen(options, () => console.log(`Example app listening on port ${port} host ${host}!`));

        console.log('Discovered Routes:');
        endpoints.forEach(endpoint => console.log(`${endpoint.route} - ${endpoint.method}`));
    };

    const writeJSONResponse = function (server, jsonResponse) {
        const {res} = server;
        res.json(JSON.parse(jsonResponse));
    };

    module.exports = {
        runExpressApplication,
        writeJSONResponse
    };
}());
