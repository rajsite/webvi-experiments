(function () {
    'use strict';
    const path = require('path');
    const fs = require('fs');
    const cheerio = require('cheerio');

    const htmlRequireAttributeName = 'webvi-node-global';

    const htmlRequire = function (resolvedHtmlPath) {
        const resolvedHtmlDir = path.dirname(resolvedHtmlPath);
        console.log(`Loading webvi-node require html file path ${resolvedHtmlPath}`);
        const endpointHTML = fs.readFileSync(resolvedHtmlPath, 'utf8');
        const $$ = cheerio.load(endpointHTML);
        console.log('Finished loading webvi-node require html file');

        console.log(`Finding require attributes in html file path ${resolvedHtmlPath}`);
        const dependencyPaths = new Map();
        $$(`script[${htmlRequireAttributeName}]`).each(function (_index, element) {
            const src = $$(element).attr('src');
            const globalName = $$(element).attr(htmlRequireAttributeName);
            if (typeof globalName !== 'string' || globalName === '') {
                throw new Error(`expected attribute ${htmlRequireAttributeName} to have non-empty string value, but found: ${globalName}`);
            }
            // Seems to be formatted with windows path format in older versions of the editor
            const srcNormalized = src.replace(/\\/g, '/');
            const dependencyPath = path.resolve(resolvedHtmlDir, srcNormalized);
            dependencyPaths.set(globalName, dependencyPath);
        });
        console.log('Finished finding require attributes');

        console.log('Discovered node dependencies:');
        dependencyPaths.forEach((dependencyPath, globalName) => console.log(`${globalName} - ${dependencyPath}`));

        console.log('Loading node dependencies...');
        const dependencies = new Map();
        dependencyPaths.forEach((dependencyPath, globalName) => {
            const dependency = require(dependencyPath);
            dependencies.set(globalName, dependency);
        });
        console.log('Finished loading node dependencies.');
        return dependencies;
    };

    module.exports = htmlRequire;
}());
