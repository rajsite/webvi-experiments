(async function () {
    'use strict';
    const path = require('path');
    const {WebVICLIRunner} = require('webvicli');
    const webvicliRunner = new WebVICLIRunner({cwd: path.resolve(__dirname, 'Builds/TestElectronMain_webvicli-electron')});
    await webvicliRunner.run();
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
});
