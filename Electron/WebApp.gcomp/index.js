(function () {
    'use strict';

    const {app, BrowserWindow, protocol} = require('electron');
    const mime = require('mime-types');
    const path = require('path');

    protocol.registerSchemesAsPrivileged([{
        scheme: 'webvi',
        privileges: {
            standard: true,
            supportFetchAPI: true
        }
    }]);

    const prefix = 'webvi://./';
    const createWindow = function () {
        protocol.registerFileProtocol('webvi', (request, callback) => {
            const url = request.url.substr(prefix.length);
            const calcpath = path.normalize(`${__dirname}/${url}`);
            const contentType = mime.contentType(path.extname(calcpath));
            const headers = {};
            if (contentType) {
                headers['Content-Type'] = contentType;
            }
            callback({
                path: calcpath,
                headers
            });
        }, (error) => {
            if (error) {
                console.error('Failed to register protocol');
            }
        });

        // Create the browser window.
        let win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true
            }
        });

        win.webContents.openDevTools();

        // and load the index.html of the app.
        win.loadURL(`${prefix}index.html`);
    };

    app.on('ready', createWindow);
}());
