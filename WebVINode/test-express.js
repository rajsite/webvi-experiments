(async function () {
    'use strict';
    const path = require('path');
    const {WebVINodeRunner} = require('@webvi-node/runner');
    const webviNodeRunner = new WebVINodeRunner({cwd: path.resolve(__dirname, 'Builds/TestExpressServer_express')});
    await webviNodeRunner.run();
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
});
