/* eslint-disable class-methods-use-this */
(function () {
    'use strict';

    const {performance} = require('perf_hooks');
    const path = require('path');
    const glob = require('glob');
    const fs = require('fs');
    const cheerio = require('cheerio');

    const {setComponentPath, setClientPath, getComponentPath} = require('./webvicliconfig.js');
    const VireoNode = require('./VireoNode.js');

    class WebVICLIRunner {
        constructor (componentPath, clientPath) {
            console.log(`Web Application Component Path: ${componentPath}`);
            console.log(`Web Application Client Path: ${clientPath}`);
            setComponentPath(componentPath);
            setClientPath(clientPath);
        }

        async run () {
            const componentPath = getComponentPath();
            const webviCLIStart = performance.now();
            console.log('Searching for node dependencies...');
            const htmlPaths = glob.sync('**/*.html', {cwd: componentPath});
            const dependencyPathSet = new Set();
            htmlPaths.forEach(htmlPath => {
                const resolvedHtmlPath = path.resolve(componentPath, htmlPath);
                const resolvedHtmlDir = path.dirname(resolvedHtmlPath);
                const endpointHTML = fs.readFileSync(resolvedHtmlPath, 'utf8');
                const $$ = cheerio.load(endpointHTML);
                const rawDependencyPaths = [];
                $$('script[webvi-express-require]').each(function (index, element) {
                    const src = $$(element).attr('src');
                    // Seems to be formatted with windows path format
                    const normalized = src.replace(/\\/g, '/');
                    rawDependencyPaths.push(normalized);
                });
                const dependencyPaths = rawDependencyPaths.map((rawDependencyPath) => path.resolve(resolvedHtmlDir, rawDependencyPath));
                dependencyPaths.forEach((dependencyPath) => dependencyPathSet.add(dependencyPath));
            });
            console.log('Finished searching for node dependencies.');

            console.log('Discovered node dependencies:');
            dependencyPathSet.forEach(dependencyPath => console.log(dependencyPath));

            console.log('Loading node dependencies...');
            dependencyPathSet.forEach(dependencyPath => require(dependencyPath));
            console.log('Finished loading node dependencies.');

            console.log('Searching for WebVICLI Main VI');
            const viaPaths = glob.sync('**/main.via.txt', {cwd: componentPath});
            if (viaPaths.length !== 1) {
                throw new Error(`Expected to find exactly one WebVICLI Main VI (main.via.txt). Found ${viaPaths.length}`);
            }
            const viaPath = viaPaths[0];
            console.log('Finished searching for WebVICLI Main VI.');

            console.log('Discoverd WebVICLI Main VI:');
            console.log(viaPath);

            console.log('Loading WebVICLI Main VI...');
            const viaWithEnqueue = fs.readFileSync(path.resolve(componentPath, viaPath), 'utf8');
            const vireoNode = new VireoNode(viaWithEnqueue);
            await vireoNode.initialize();
            console.log('Finished loading WebVICLI Main VI.');

            console.log('Running WebVICLI Main VI...');
            console.log('---------------------------');
            vireoNode.enqueueVI();
            await vireoNode.vireo.eggShell.executeSlicesUntilClumpsFinished();
            console.log('----------------------------------');
            console.log('Finished running WebVICLI Main VI.');
            const webviCLIEnd = performance.now();
            const SECONDS_PER_MILLISECOND = 1000;
            console.log(`WebVICLI took ${(webviCLIEnd - webviCLIStart) / SECONDS_PER_MILLISECOND} seconds to run.`);
        }
    }

    module.exports = WebVICLIRunner;
}());
