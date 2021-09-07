// Must be run using the electron cli
(async function () {
    'use strict';
    const path = require('path');
    const WebVINodeRunner = require('@webvi-node/runner');
    const webviNodeRunner = new WebVINodeRunner({cwd: path.resolve(__dirname, 'Builds/ElectronExample_Default Web Server')});
    await webviNodeRunner.run();
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
    process.exit(1);
});
