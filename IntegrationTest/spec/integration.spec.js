describe('The WebVI Application', function () {
    'use strict';
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    const express = require('express');
    const puppeteer = require('puppeteer');
    const portFinder = require('portfinder');

    const waitForServerStart = function (app, port) {
        return new Promise(resolve => {
            const server = app.listen(port, () => {
                resolve(server);
            });
        });
    };

    const createStaticServer = async function (folder) {
        const port = await portFinder.getPortPromise();
        const app = express();
        app.use(express.static(folder, {fallthrough: false}));
        const server = await waitForServerStart(app, port);
        return server;
    };

    const readValue = async function (page, label) {
        const readValueInPage = function (label) {
            const labelElement = document.querySelector(`ni-label[text="${label}"]`);
            if (labelElement === null) {
                throw new Error(`Unable to find control with label: ${label}`);
            }
            const labelId = labelElement.getAttribute('ni-control-id');
            const valueElement = document.querySelector(`[label-id="${labelId}"]`);
            const dataItem = valueElement.bindingInfo.dataItem;
            const webApp = document.querySelector('ni-web-application');
            const vi = document.querySelector('ni-virtual-instrument');
            const vireoHelpers = webApp.vireoHelpers;
            const vireo = webApp.vireoInstance;
            const viName = vi.viName;
            const viNameEncoded = vireoHelpers.staticHelpers.encodeIdentifier(viName);
            const valueRef = vireo.eggShell.findValueRef(viNameEncoded, dataItem);
            const valueJSON = vireo.eggShell.readJSON(valueRef);
            const value = JSON.parse(valueJSON);
            return value;
        };
        const result = await page.evaluate(readValueInPage, label);
        return result;
    };

    const pageErrorMonitor = function (page) {
        let cleanup, stop;
        const promise = new Promise(function (resolve, reject) {
            const pageErrorHandler = error => {
                reject(new Error(`[browser uncaught page error]: ${error.message}`));
                cleanup();
            };
            const requestFailedHandler = request => {
                reject(new Error(`[browser network request error]: ${request.failure().errorText} [failed request url]: ${request.url()}`));
                cleanup();
            };
            cleanup = function () {
                page.off('pageerror', pageErrorHandler);
                page.off('requestfailed', requestFailedHandler);
            };
            stop = function () {
                resolve();
                cleanup();
                return promise;
            };
            page.on('pageerror', pageErrorHandler);
            page.on('requestfailed', requestFailedHandler);
        });
        return {
            stop,
            cleanup
        };
    };

    const runWebVI = async function (server, browser, path) {
        const timeout = 60000;
        const port = server.address().port;
        const hostname = '127.0.0.1';
        const htmlFixtureUrl = `http://${hostname}:${port}/${path}`;
        const page = await browser.newPage();
        const monitor = pageErrorMonitor(page);

        try {
            page.setDefaultTimeout(timeout);
            await page.goto(htmlFixtureUrl);
            await page.waitForSelector('ni-web-application[service-state="STOPPED"]');
            await monitor.stop();
            return page;
        } finally {
            monitor.cleanup();
        }
    };

    let server, browser;
    beforeAll(async function () {
        server = await createStaticServer('./Builds/');
        browser = await puppeteer.launch({
            headless: true
        });
    });

    afterAll(async function () {
        await browser.close();
        server.close();
        server = browser = undefined;
    });

    it('can run a loop ten times', async function () {
        const page = await runWebVI(server, browser, 'WebApp_Web Server/index.html');
        const result = await readValue(page, 'loop iteration');
        const expected = 10;
        expect(result).toBe(expected);

        await page.close();
    });
});
