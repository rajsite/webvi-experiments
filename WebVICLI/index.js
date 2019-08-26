(async function () {
    'use strict';
    const path = require('path');
    const {WebVICLIRunner} = require('webvicli');
    console.log(`Current Working Directory: ${__dirname}`);
    const componentPath = path.resolve(__dirname, 'Builds/Main_ElectronHelloWorld').toString();
    const clientPath = path.resolve(__dirname, 'Builds/Render_ElectronHelloWorld').toString();
    const webvicliRunner = new WebVICLIRunner(componentPath, clientPath);
    await webvicliRunner.run();
}()).catch(function (ex) {
    'use strict';
    console.error(ex);
});
