(function () {
    'use strict';

    const path = require('path');
    const electron = require('electron');

    const scheme = 'webvi-node';
    const host = '.';
    const origin = `${scheme}://${host}`;
    const root = `${origin}/`;

    // TODO registerSchemeAsPrivileged should be moved to plugin pattern
    // Can only configure pre app ready behavior from cli
    (function () {
        const {app, protocol} = electron;
        // To disable CORS in the render process https://github.com/electron/electron/issues/23664
        app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
        protocol.registerSchemesAsPrivileged([{
            scheme,
            privileges: {
                standard: true,
                supportFetchAPI: true
            }
        }]);
    }());

    const registerFileProtocol = function (clientPath) {
        const {protocol} = electron;
        const handler = function (request, callback) {
            try {
                const url = request.url.substr(root.length);
                const calcpath = path.normalize(`${path.resolve(clientPath)}/${url}`);
                console.log(`---- ${clientPath}  and  ${calcpath}`);
                callback({
                    path: calcpath
                });
            } catch (ex) {
                // Net error codes: https://cs.chromium.org/chromium/src/net/base/net_error_list.h
                const failed = -2;
                callback(failed);
            }
        };
        protocol.registerFileProtocol(scheme, handler);
    };

    const initializeElectron = async function (clientPath) {
        const {app} = electron;
        await app.whenReady();
        registerFileProtocol(clientPath);
    };

    const createBrowserWindow = async function () {
        const {BrowserWindow} = electron;

        const browserWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                // Disabling web security disables CORS for HTTP requests, should make configurable instead
                webSecurity: false,
                allowRunningInsecureContent: false,
                nodeIntegration: true,
                nativeWindowOpen: true
            }
        });
        browserWindow.webContents.openDevTools();

        // and load the index.html of the app.
        browserWindow.loadURL(`${root}index.html`);
        return browserWindow;
    };

    module.exports = {
        initializeElectron,
        createBrowserWindow
    };
}());
