(function () {
    'use strict';

    const {performance} = require('perf_hooks');
    const fs = require('fs');
    const process = require('process');
    const glob = require('glob');
    const htmlRequire = require('./htmlRequire.js');
    const VireoNode = require('./VireoNode.js');

    const MILLISECOND_PER_SECOND = 1000;

    class WebVINodeRunner {
        constructor ({cwd = process.cwd()} = {}) {
            // TODO rename cwd to searchPath or something
            // take an optional cwd and an optional via file path
            // TODO take a path to a .via.txt file
            // assume it has a corresponding .html file
            console.log('WebVINode Main File load start');
            const webviNodeMainFileLoadStart = performance.now();
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

            console.log('Searching for WebVINode Main VI');
            const viaPaths = glob.sync('**/main.via.txt', {absolute: true, cwd});
            if (viaPaths.length !== 1) {
                throw new Error(`Expected to find exactly one WebVINode Main VI (main.via.txt). Found ${viaPaths.length}`);
            }
            const viaPath = viaPaths[0];
            console.log('Finished searching for WebVINode Main VI.');

            console.log('Discoverd WebVINode Main VI:');
            console.log(viaPath);

            // htmlRequire for main should always be synchronous with node startup for dependencies that have to run at that time
            console.log('Loading Main VI HTML WebVINode require attributes');
            htmlRequire(htmlPath);
            console.log('Finished loading Main VI HTML WebVINode require attributes');

            console.log('Loading Main VI via');
            const viaWithEnqueue = fs.readFileSync(viaPath, 'utf8');
            const vireoNode = new VireoNode(viaWithEnqueue);
            console.log('Finished loading Main VI via');

            const webviNodeMainFileLoadEnd = performance.now();
            console.log(`WebVINode Main File load took ${(webviNodeMainFileLoadEnd - webviNodeMainFileLoadStart) / MILLISECOND_PER_SECOND} seconds to run.`);

            this._vireoNode = vireoNode;
        }

        async run () {
            // TODO check if main has a cli dataItem and create a reference if it does. WebVINode will expose an api to get the configured current working directory
            console.log('Starting WebVINode main execution');
            const webviNodeStart = performance.now();
            console.log('Instancing Vireo runtime for Main VI...');
            await this._vireoNode.initialize();
            console.log('Finished instancing Vireo runtime for Main VI.');

            console.log('Running WebVINode Main VI...');
            console.log('---------------------------');
            this._vireoNode.enqueueVI();
            await this._vireoNode.vireo.eggShell.executeSlicesUntilClumpsFinished();
            console.log('----------------------------------');
            console.log('Finished running WebVINode Main VI.');
            const webviNodeEnd = performance.now();

            console.log(`WebVINode main execution took ${(webviNodeEnd - webviNodeStart) / MILLISECOND_PER_SECOND} seconds to run.`);
        }
    }

    module.exports = WebVINodeRunner;
}());
