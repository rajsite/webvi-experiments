(function () {
    'use strict';

    const mime = require('mime-types');
    const path = require('path');

    const webvicli = require('webvicli');
    const clientPath = webvicli.getClientPath();
    const referenceManager = webvicli.getReferenceManager();

    const scheme = 'webvicli';
    const origin = `${scheme}://.`;
    const root = `${origin}/`;

    const electron = require('electron');

    // TODO registerSchemeAsPrivileged should be moved to plugin pattern
    // Can only configure pre app ready behavior from cli
    (function () {
        const {protocol} = electron;
        protocol.registerSchemesAsPrivileged([{
            scheme,
            privileges: {
                standard: true,
                supportFetchAPI: true
            }
        }]);
    }());

    const registerWebVICLIFileProtocol = function () {
        return new Promise(function (resolve, reject) {
            const {protocol} = electron;
            const handler = function (request, callback) {
                try {
                    const url = request.url.substr(root.length);
                    const calcpath = path.normalize(`${clientPath}/${url}`);
                    const contentType = mime.contentType(path.extname(calcpath));
                    const headers = {};
                    if (contentType) {
                        headers['Content-Type'] = contentType;
                    }
                    // Currently need 'unsafe-eval' to support wasm in Chrome https://github.com/WebAssembly/content-security-policy/issues/7
                    headers['Content-Security-Policy'] = `script-src 'self' 'unsafe-eval'; object-src 'self';`;
                    callback({
                        path: calcpath,
                        headers
                    });
                } catch (ex) {
                    // Net error codes: https://cs.chromium.org/chromium/src/net/base/net_error_list.h
                    const failed = -2;
                    callback(failed);
                }
            };
            const completion = function (error) {
                if (error) {
                    reject(new Error(`Failed to register file protocol for scheme ${scheme}`));
                }
                resolve();
            };
            protocol.registerFileProtocol(scheme, handler, completion);
        });
    };

    const initializeElectron = async function () {
        const {app} = electron;
        await app.whenReady();
        await registerWebVICLIFileProtocol();
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
                nodeIntegration: true
            }
        });

        // and load the index.html of the app.
        browserWindow.loadURL(`${root}index.html`);
        const browserWindowReference = referenceManager.createReference(browserWindow);
        return browserWindowReference;
    };

    global.WebVIElectron = {
        initializeElectron,
        createBrowserWindow
    };
}());
