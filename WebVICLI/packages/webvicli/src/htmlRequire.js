(function () {
    'use strict';
    // node imports
    const path = require('path');
    const fs = require('fs');

    // webvicli imports
    const cheerio = require('cheerio');

    const htmlRequireAttributeName = 'webvi-express-require';

    const htmlRequire = function (resolvedHtmlPath) {
        const dependencyPathSet = new Set();
        const resolvedHtmlDir = path.dirname(resolvedHtmlPath);

        console.log(`Loading webvicli require html file path ${resolvedHtmlPath}`);
        const endpointHTML = fs.readFileSync(resolvedHtmlPath, 'utf8');
        const $$ = cheerio.load(endpointHTML);
        console.log('Finished loading webvicli require html file');

        console.log(`Finding require attributes in html file path ${resolvedHtmlPath}`);
        const rawDependencyPaths = [];
        $$(`script[${htmlRequireAttributeName}]`).each(function (index, element) {
            const src = $$(element).attr('src');
            // Seems to be formatted with windows path format
            const normalized = src.replace(/\\/g, '/');
            rawDependencyPaths.push(normalized);
        });
        const dependencyPaths = rawDependencyPaths.map((rawDependencyPath) => path.resolve(resolvedHtmlDir, rawDependencyPath));
        dependencyPaths.forEach((dependencyPath) => dependencyPathSet.add(dependencyPath));
        console.log('Finished finding require attributes');

        console.log('Discovered node dependencies:');
        dependencyPathSet.forEach(dependencyPath => console.log(dependencyPath));

        console.log('Loading node dependencies...');
        dependencyPathSet.forEach(dependencyPath => require(dependencyPath));
        console.log('Finished loading node dependencies.');
    };

    module.exports = htmlRequire;
}());
