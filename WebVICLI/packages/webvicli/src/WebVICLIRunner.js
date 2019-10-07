/* eslint-disable class-methods-use-this */
(function () {
    'use strict';

    // node imports
    const {performance} = require('perf_hooks');
    const fs = require('fs');
    const process = require('process');

    // webvicli imports
    const glob = require('glob');
    const htmlRequire = require('./htmlRequire');
    const VireoNode = require('./VireoNode.js');

    const SECONDS_PER_MILLISECOND = 1000;

    class WebVICLIRunner {
        constructor () {
            console.log('WebVICLI Main File load start');
            const webviCLIMainFileLoadStart = performance.now();
            const cwd = process.cwd();
            console.log(`Current Working Directory: ${cwd}`);

            console.log('Searching for Main VI HTML in current working directory');
            const htmlPaths = glob.sync('**/main.html', {absolute: true});
            if (htmlPaths.length !== 1) {
                throw new Error(`Expected to find exactly one Main VI HTML (main.html). Found ${htmlPaths.length}`);
            }
            const htmlPath = htmlPaths[0];
            console.log('Finished searching for Main VI HTML');

            console.log('Discoverd Main VI HTML:');
            console.log(htmlPath);

            console.log('Searching for WebVICLI Main VI');
            const viaPaths = glob.sync('**/main.via.txt', {absolute: true});
            if (viaPaths.length !== 1) {
                throw new Error(`Expected to find exactly one WebVICLI Main VI (main.via.txt). Found ${viaPaths.length}`);
            }
            const viaPath = viaPaths[0];
            console.log('Finished searching for WebVICLI Main VI.');

            console.log('Discoverd WebVICLI Main VI:');
            console.log(viaPath);

            // htmlRequire for main should always be synchronous with node startup for dependencies that have to run at that time
            console.log('Loading Main VI HTML WebVICLI require attributes');
            htmlRequire(htmlPath);
            console.log('Finished loading Main VI HTML WebVICLI require attributes');

            console.log('Loading Main VI via');
            const viaWithEnqueue = fs.readFileSync(viaPath, 'utf8');
            const vireoNode = new VireoNode(viaWithEnqueue);
            console.log('Finished loading Main VI via');

            const webviCLIMainFileLoadEnd = performance.now();
            console.log(`WebVICLI Main File load took ${(webviCLIMainFileLoadEnd - webviCLIMainFileLoadStart) / SECONDS_PER_MILLISECOND} seconds to run.`);

            this._vireoNode = vireoNode;
        }

        async run () {
            console.log('Starting WebVICLI main execution');
            const webviCLIStart = performance.now();
            console.log('Instancing Vireo runtime for Main VI...');
            await this._vireoNode.initialize();
            console.log('Finished instancing Vireo runtime for Main VI.');

            console.log('Running WebVICLI Main VI...');
            console.log('---------------------------');
            this._vireoNode.enqueueVI();
            await this._vireoNode.vireo.eggShell.executeSlicesUntilClumpsFinished();
            console.log('----------------------------------');
            console.log('Finished running WebVICLI Main VI.');
            const webviCLIEnd = performance.now();

            console.log(`WebVICLI main execution took ${(webviCLIEnd - webviCLIStart) / SECONDS_PER_MILLISECOND} seconds to run.`);
        }
    }

    module.exports = WebVICLIRunner;
}());
