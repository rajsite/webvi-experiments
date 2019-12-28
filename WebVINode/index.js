(async function () {
    'use strict';
    const path = require('path');
    const {WebVICLIRunner} = require('@webvi-node/runner');
    const webvicliRunner = new WebVICLIRunner({cwd: path.resolve(__dirname, 'Builds/TestElectronMain_electron')});
    await webvicliRunner.run();
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
});
