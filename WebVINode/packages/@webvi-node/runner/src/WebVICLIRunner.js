(function () {
    'use strict';

    // node imports
    const {performance} = require('perf_hooks');
    const fs = require('fs');
    const process = require('process');

    // webvicli imports
    const glob = require('glob');
    const htmlRequire = require('./htmlRequire.js');
    const VireoNode = require('./VireoNode.js');

    const MILLISECOND_PER_SECOND = 1000;

    class WebVICLIRunner {
        constructor ({cwd = process.cwd()} = {}) {
            // TODO rename cwd to searchPath or something
            // take an optional cwd and an optional via file path
            // TODO take a path to a .via.txt file
            // assume it has a corresponding .html file
            console.log('WebVICLI Main File load start');
            const webviCLIMainFileLoadStart = performance.now();
            console.log(`Current Working Directory: ${cwd}`);

            console.log('Searching for Main VI HTML in current working directory');
            const htmlPaths = glob.sync('**/main.html', {absolute: true, cwd});
            if (htmlPaths.length !== 1) {
                throw new Error(`Expected to find exactly one Main VI HTML (main.html). Found ${htmlPaths.length}`);
            }
            const htmlPath = htmlPaths[0];
            console.log('Finished searching for Main VI HTML');

            console.log('Discoverd Main VI HTML:');
            console.log(htmlPath);

            console.log('Searching for WebVICLI Main VI');
            const viaPaths = glob.sync('**/main.via.txt', {absolute: true, cwd});
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
            console.log(`WebVICLI Main File load took ${(webviCLIMainFileLoadEnd - webviCLIMainFileLoadStart) / MILLISECOND_PER_SECOND} seconds to run.`);

            this._vireoNode = vireoNode;
        }

        async run () {
            // TODO check if main has a cli dataItem and create a reference if it does. webvicli will expose an api to get the configured current working directory
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

            console.log(`WebVICLI main execution took ${(webviCLIEnd - webviCLIStart) / MILLISECOND_PER_SECOND} seconds to run.`);
        }
    }

    module.exports = WebVICLIRunner;
}());
