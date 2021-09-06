const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

(async () => {
    'use strict';
    const examplesDir = path.join(__dirname, '../examples');
    console.log(`Examples directory: ${examplesDir}`);
    const packagesDir = path.join(__dirname, '../packages');
    console.log(`Packages directory: ${packagesDir}`);

    const installActions = getDirectories(examplesDir)
        .map(exampleName => {
            const exampleDir = path.join(examplesDir, exampleName);
            const requiredWebvINodePackages = getRequiredWebVINodePackages(exampleDir);
            return {
                exampleName,
                requiredWebvINodePackages
            };
        })
        .map(({exampleName, requiredWebvINodePackages}) => {
            const exampleDir = path.join(examplesDir, exampleName);
            const packagePaths = requiredWebvINodePackages.map(packageName => path.join(packagesDir, packageName));
            return async () => {
                console.log(`[Example] ${exampleName} [installing dependencies] ${requiredWebvINodePackages.join(', ') || 'none'}`);
                await installPackagesForExample(exampleDir, packagePaths);
            };
        });
    for (const installAction of installActions) {
        // Run the npm install actions sequentially
        // eslint-disable-next-line no-await-in-loop
        await installAction();
    }

    function getDirectories (source) {
        return fs.readdirSync(source, {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    }

    function getRequiredWebVINodePackages (packageDir) {
        const packageFile = path.join(packageDir, 'package.json');
        const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        return Object.keys(packageContent.dependencies)
            .filter(packageName => /^@webvi-node\//.test(packageName));
    }
    async function installPackagesForExample (exampleDir, packagePaths) {
        const commmand = `npm install ${packagePaths.join(' ')}`;
        await exec(commmand, {cwd: exampleDir});
    }
})().catch(ex => {
    'use strict';
    console.error(ex);
    process.exit(1);
});
