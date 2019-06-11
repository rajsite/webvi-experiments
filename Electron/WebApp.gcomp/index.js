(function () {
    'use strict';

    const {app, BrowserWindow} = require('electron');

    const createWindow = function () {
        // Create the browser window.
        let win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {nodeIntegration: true}
        });

        // and load the index.html of the app.
        win.loadFile('index.html');
    };

    app.on('ready', createWindow);
}());
