(async function () {
    'use strict';

    // General helper functions
    let domContentLoaded = function () {
        return new Promise(function (resolve) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => resolve());
            } else {
                resolve();
            }
        });
    };

    // Aliases
    let invokeAsWebVI = window.webvisimulator.invokeAsWebVI;

    // Test code
    let batteryError = function (ex) {
        window.battery_error.value = ex.message;
        console.error(ex);
    };

    let batteryEnable = async function () {
        // Based on https://googlechrome.github.io/samples/web-bluetooth/notifications.html?service=battery_service&characteristic=battery_level
        try {
            let requestDataOptionsJSON = JSON.stringify({
                filters: [{
                    services: ['battery_service']
                }]
            });

            let deviceRefnum = await invokeAsWebVI('webvi_web_bluetooth.requestDevice', [
                requestDataOptionsJSON,
                '#battery_connect',
                'click'
            ]);

            let gattServerRefnum = await invokeAsWebVI('webvi_web_bluetooth.gattServerConnect', [
                deviceRefnum
            ]);

            let serviceRefnum = await invokeAsWebVI('webvi_web_bluetooth.getPrimaryService', [
                gattServerRefnum,
                'battery_service'
            ]);

            let characteristicRefnum = await invokeAsWebVI('webvi_web_bluetooth.getCharacteristic', [
                serviceRefnum,
                'battery_level'
            ]);

            let value = await invokeAsWebVI('webvi_web_bluetooth.readValue', [
                characteristicRefnum
            ]);

            window.battery_result.value = value;

            window.battery_notifications.onclick = async function () {
                try {
                    let notificationBufferRefnum = await invokeAsWebVI('webvi_web_bluetooth.startCharacteristicNotification', [
                        characteristicRefnum
                    ]);
                    let result;
                    let loopExp = true;
                    while (loopExp) {
                        result = await invokeAsWebVI('webvi_web_bluetooth.readCharacteristicNotification', [
                            notificationBufferRefnum
                        ]);
                        window.battery_result.value = result + ' ' + window.battery_result.value;
                        loopExp = true;
                    }
                } catch (ex) {
                    batteryError(ex);
                }
            };

            window.battery_disconnect.onclick = async function () {
                try {
                    invokeAsWebVI('webvi_web_bluetooth.gattServerDisconnect', [
                        deviceRefnum
                    ]);
                } catch (ex) {
                    batteryError(ex);
                }
            };
        } catch (ex) {
            batteryError(ex);
        }
    };

    let getPlaybulbRGBColorArray = function () {
        return window.playbulb_color.value.match(/#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/).slice(1).map(hex => parseInt(hex, 16));
    };

    let playbulbError = function (ex) {
        window.playbulb_error.value = ex.message;
        console.error(ex);
    };

    let playbulbEnable = async function () {
        /* eslint-disable no-magic-numbers */
        // Based on https://googlecodelabs.github.io/candle-bluetooth/playbulbCandle.js
        try {
            const CANDLE_SERVICE_UUID = invokeAsWebVI('webvi_web_bluetooth.canonicalUUID', [
                0xFF02
            ]);
            // const CANDLE_DEVICE_NAME_UUID = invokeAsWebVI('webvi_web_bluetooth.canonicalUUID', [
            //     0xFFFF
            // ]);
            const CANDLE_COLOR_UUID = invokeAsWebVI('webvi_web_bluetooth.canonicalUUID', [
                0xFFFC
            ]);
            // const CANDLE_EFFECT_UUID = invokeAsWebVI('webvi_web_bluetooth.canonicalUUID', [
            //     0xFFFB
            // ]);

            let requestDataOptionsJSON = JSON.stringify({
                filters: [{
                    services: [CANDLE_SERVICE_UUID]
                }]
            });

            let deviceRefnum = await invokeAsWebVI('webvi_web_bluetooth.requestDevice', [
                requestDataOptionsJSON,
                '#playbulb_connect',
                'click'
            ]);

            let gattServerRefnum = await invokeAsWebVI('webvi_web_bluetooth.gattServerConnect', [
                deviceRefnum
            ]);

            let serviceRefnum = await invokeAsWebVI('webvi_web_bluetooth.getPrimaryService', [
                gattServerRefnum,
                CANDLE_SERVICE_UUID
            ]);

            let characteristicRefnum = await invokeAsWebVI('webvi_web_bluetooth.getCharacteristic', [
                serviceRefnum,
                CANDLE_COLOR_UUID
            ]);

            // let value = await invokeAsWebVI('webvi_web_bluetooth.readValue', [
            //     characteristicRefnum
            // ]);

            // window.battery_result.value = value;

            window.playbulb_send.onclick = async function () {
                try {
                    await invokeAsWebVI('webvi_web_bluetooth.writeValue', [
                        characteristicRefnum,
                        new Uint8Array([0x00, ...getPlaybulbRGBColorArray()])
                    ]);
                } catch (ex) {
                    playbulbError(ex);
                }
            };

            window.playbulb_disconnect.onclick = async function () {
                try {
                    invokeAsWebVI('webvi_web_bluetooth.gattServerDisconnect', [
                        deviceRefnum
                    ]);
                } catch (ex) {
                    playbulbError(ex);
                }
            };
        } catch (ex) {
            playbulbError(ex);
        }
    };

    let puckjsError = function (ex) {
        window.puckjs_error.value = ex.message;
        console.error(ex);
    };

    let puckjsEnable = async function () {
        // Based on http://www.espruino.com/About+Bluetooth+LE#the-puck-s-services
        try {
            const NORDIC_UART_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
            // Can only transmit up to 20 bytes at a time
            const NORDIC_TX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
            const NORDIC_RX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

            let requestDataOptionsJSON = JSON.stringify({
                filters: [{
                    services: [NORDIC_UART_UUID]
                }]
            });

            let deviceRefnum = await invokeAsWebVI('webvi_web_bluetooth.requestDevice', [
                requestDataOptionsJSON,
                '#puckjs_connect',
                'click'
            ]);

            let gattServerRefnum = await invokeAsWebVI('webvi_web_bluetooth.gattServerConnect', [
                deviceRefnum
            ]);

            let serviceRefnum = await invokeAsWebVI('webvi_web_bluetooth.getPrimaryService', [
                gattServerRefnum,
                NORDIC_UART_UUID
            ]);

            let txCharacteristicRefnum = await invokeAsWebVI('webvi_web_bluetooth.getCharacteristic', [
                serviceRefnum,
                NORDIC_TX_UUID
            ]);

            let rxCharacteristicRefnum = await invokeAsWebVI('webvi_web_bluetooth.getCharacteristic', [
                serviceRefnum,
                NORDIC_RX_UUID
            ]);

            let textDecoder = new TextDecoder();
            window.puckjs_notifications.onclick = async function () {
                try {
                    let notificationBufferRefnum = await invokeAsWebVI('webvi_web_bluetooth.startCharacteristicNotification', [
                        rxCharacteristicRefnum
                    ]);
                    let loopExp = true;
                    while (loopExp) {
                        let resultBuffer = await invokeAsWebVI('webvi_web_bluetooth.readCharacteristicNotification', [
                            notificationBufferRefnum
                        ]);
                        let result = textDecoder.decode(resultBuffer);
                        window.puckjs_result.value += result;
                        loopExp = true;
                    }
                } catch (ex) {
                    puckjsError(ex);
                }
            };

            let textEncoder = new TextEncoder();
            window.puckjs_send.onclick = async function () {
                try {
                    await invokeAsWebVI('webvi_web_bluetooth.writeValue', [
                        txCharacteristicRefnum,
                        textEncoder.encode(window.puckjs_command.value + '\n')
                    ]);
                } catch (ex) {
                    puckjsError(ex);
                }
            };

            window.puckjs_disconnect.onclick = async function () {
                try {
                    invokeAsWebVI('webvi_web_bluetooth.gattServerDisconnect', [
                        deviceRefnum
                    ]);
                } catch (ex) {
                    puckjsError(ex);
                }
            };
        } catch (ex) {
            puckjsError(ex);
        }
    };

    // Run test
    await domContentLoaded();
    window.battery_enable.onclick = batteryEnable;
    window.playbulb_enable.onclick = playbulbEnable;
    window.puckjs_enable.onclick = puckjsEnable;
}());
