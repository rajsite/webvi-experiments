// Must be run using the electron cli
(async function () {
    'use strict';
    const path = require('path');
    const WebVINodeRunner = require('@webvi-node/runner');
    const webviNodeRunner = new WebVINodeRunner({cwd: path.resolve(__dirname, 'Builds/TestElectronMain_electron')});
    await webviNodeRunner.run();
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
});
