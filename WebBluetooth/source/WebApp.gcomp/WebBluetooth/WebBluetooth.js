(function () {
    'use strict';

    const makeAsync = function (jsapi, asyncFn) {
        const completionCallback = jsapi.getCompletionCallback();
        asyncFn().then(completionCallback).catch(completionCallback);
    };

    const eventOccurence = function (element, eventName) {
        return new Promise(function (resolve) {
            const handler = element.addEventListener(eventName, () => {
                element.removeEventListener(eventName, handler);
                resolve();
            });
        });
    };

    // zero is an invalid refnum
    let nextRefnum = 1;
    class RefnumManager {
        constructor () {
            this.refnums = new Map();
        }

        createRefnum (obj) {
            const refnum = nextRefnum;
            nextRefnum += 1;
            this.refnums.set(refnum, obj);
            return refnum;
        }

        getObject (refnum) {
            return this.refnums.get(refnum);
        }

        closeRefnum (refnum) {
            this.refnums.delete(refnum);
        }
    }

    const refnumManager = new RefnumManager();

    // Used to convert from 16-bit or 32-bit UUID numbers to 128-bit UUID strings
    const canonicalUUID = function (alias) {
        if (window.navigator.bluetooth === undefined) {
            throw new Error('Web Bluetooth is not supported by this browser');
        }

        return window.BluetoothUUID.canonicalUUID(alias);
    };

    const parseRequestDeviceOptions = function (requestDeviceOptionsJSON) {
        try {
            // TODO: Use a reviver or something for manufacturerData and serviceData https://github.com/WebBluetoothCG/web-bluetooth/issues/407
            return JSON.parse(requestDeviceOptionsJSON);
        } catch (ex) {
            throw new Error(`Could not parse the provided requestDeviceOptionsJSON as JSON: ${requestDeviceOptionsJSON}. Parsing results in the following error:${ex}.`);
        }
    };

    /**
     * Starting point for making a Web Bluetooth connection.
     * Web Bluetooth requires an interaction from a user
     *
     * @param requestDeviceOptionsJSON
     *  Provide the options property for the requestDevice function as JSON.
     *  This does currently prevent certain types of filters where you must pass values that can't be represented as JSON.
     *  Some known filter types that are unsupported are manufacturerData and serviceData which use Uint8Array as the representation
     *
     * @param selector
     *  The selector for the element in the page will be used for starting the user interaction.
     *  The selector string for an element can be found in the right-rail of LabVIEW NXG when a control is selected.
     *
     * @param eventName
     *  Only events "triggered by user activation" can be used: https://html.spec.whatwg.org/multipage/interaction.html#activation.
     *  By default the "click" event will be used if an empty eventName is provided.
     *  The event will only fire once per call to setupSingleTriggerElement.
     *
     * @returns
     *  A refnum for the bluetooth device to use with the web bluetooth api
     */
    const requestDevice = function (requestDeviceOptionsJSON, selector, eventName, jsapi) {
        makeAsync(jsapi, async function () {
            if (window.navigator.bluetooth === undefined) {
                throw new Error('Web Bluetooth is not supported by this browser');
            }

            const requestDeviceOptions = parseRequestDeviceOptions(requestDeviceOptionsJSON);

            const elements = document.querySelectorAll(selector);
            if (elements.length !== 1) {
                throw new Error(`Exactly one element must match the provided selector: ${selector}. Instead found the following number: ${elements.length}.`);
            }
            const element = elements[0];

            const validEventName = (typeof eventName !== 'string' || eventName.length === 0) ?
                'click' :
                eventName;

            await eventOccurence(element, validEventName);

            const device = await window.navigator.bluetooth.requestDevice(requestDeviceOptions);
            const deviceRefnum = refnumManager.createRefnum(device);
            // TODO instead return JSON with device refnum, device name, and device id: https://webbluetoothcg.github.io/web-bluetooth/#bluetoothdevice
            return deviceRefnum;
        });
    };

    // TODO maybe should have gattServer and gattServerConnect / gattServerDisconnect? Seems strange to ask device to disconnect gatt server instead of server itself
    const gattServerConnect = function (deviceRefnum, jsapi) {
        makeAsync(jsapi, async function () {
            const device = refnumManager.getObject(deviceRefnum);
            if (device instanceof window.BluetoothDevice === false) {
                throw new Error(`Expected gattServerConnect to be invoked with a deviceRefnum, instead got: ${device}`);
            }
            const gattServer = await device.gatt.connect();
            const gattServerRefnum = refnumManager.createRefnum(gattServer);
            return gattServerRefnum;
        });
    };

    const gattServerDisconnect = function (deviceRefnum) {
        const device = refnumManager.getObject(deviceRefnum);
        if (device instanceof window.BluetoothDevice === false) {
            throw new Error(`Expected gattServerDisconnect to be invoked with a deviceRefnum, instead got: ${device}`);
        }

        // TODO services, characteristics, and descriptors become invalid on disconnect: https://webbluetoothcg.github.io/web-bluetooth/#persistence
        // Maybe we should track and auto clean-up those references?
        device.gatt.disconnect();
    };

    // For information about primary vs included services: https://webbluetoothcg.github.io/web-bluetooth/#information-model
    const getPrimaryService = function (gattServerRefnum, serviceName, jsapi) {
        makeAsync(jsapi, async function () {
            const gattServer = refnumManager.getObject(gattServerRefnum);
            if (gattServer instanceof window.BluetoothRemoteGATTServer === false) {
                throw new Error(`Expected getPrimaryService to be invoked with a gattServerRefnum, instead got: ${gattServer}`);
            }

            const service = await gattServer.getPrimaryService(serviceName);
            const serviceRefnum = refnumManager.createRefnum(service);
            return serviceRefnum;
        });
    };

    const getCharacteristic = function (serviceRefnum, characteristicName, jsapi) {
        makeAsync(jsapi, async function () {
            const service = refnumManager.getObject(serviceRefnum);
            if (service instanceof window.BluetoothRemoteGATTService === false) {
                throw new Error(`Expected getCharacteristic to be invoked with a serviceRefnum, instead got: ${service}`);
            }

            const characteristic = await service.getCharacteristic(characteristicName);
            const characteristicRefnum = refnumManager.createRefnum(characteristic);
            return characteristicRefnum;
        });
    };

    const readValue = function (characteristicRefnum, jsapi) {
        makeAsync(jsapi, async function () {
            const characteristic = refnumManager.getObject(characteristicRefnum);
            if (characteristic instanceof window.BluetoothRemoteGATTCharacteristic === false) {
                throw new Error(`Expected readValue to be invoked with a characteristicRefnum, instead got: ${characteristic}`);
            }

            const valueDataView = await characteristic.readValue();
            // DataView documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
            return new Uint8Array(valueDataView.buffer);
        });
    };

    const writeValue = function (characteristicRefnum, value, jsapi) {
        makeAsync(jsapi, async function () {
            const characteristic = refnumManager.getObject(characteristicRefnum);
            if (characteristic instanceof window.BluetoothRemoteGATTCharacteristic === false) {
                throw new Error(`Expected readValue to be invoked with a characteristicRefnum, instead got: ${characteristic}`);
            }

            await characteristic.writeValue(value);
        });
    };

    class DataQueue {
        constructor () {
            this.queue = [];
            this.pendingResolve = undefined;
            this.pendingReject = undefined;
        }

        enqueue (data) {
            if (this.queue === undefined) {
                throw new Error(`The queue has already been destroyed, cannot enqueue new data: ${data}`);
            }

            this.queue.push(data);

            if (this.pendingResolve !== undefined) {
                this.pendingResolve(this.queue.shift());
                this.pendingResolve = undefined;
                this.pendingReject = undefined;
            }
        }

        dequeue () {
            if (this.queue === undefined) {
                throw new Error('The queue has already been destroyed, cannot dequeue any data.');
            }

            if (this.pendingResolve !== undefined) {
                throw new Error('A pending dequeue operation already exists. Only one pending dequeue operation allowed at a time.');
            }

            if (this.queue.length === 0) {
                return new Promise((resolve, reject) => {
                    this.pendingResolve = resolve;
                    this.pendingReject = reject;
                });
            }

            return this.queue.shift();
        }

        destroy () {
            if (this.pendingResolve !== undefined) {
                this.pendingReject(new Error('Pending dequeue operation failed due to queue destruction.'));
                this.pendingResolve = undefined;
                this.pendingReject = undefined;
            }
            this.pendingResolve = undefined;

            const remaining = this.queue;
            this.queue = undefined;
            return remaining;
        }
    }

    class CharacteristicMonitor {
        constructor (characteristic) {
            this.characteristic = characteristic;
            this.queue = new DataQueue();

            this.handler = (evt) => {
                this.queue.enqueue(new Uint8Array(evt.target.value.buffer));
            };
            this.stopHandler = () => {
                this.stop();
            };

            this.characteristic.addEventListener('characteristicvaluechanged', this.handler);
            this.characteristic.service.device.addEventListener('gattserverdisconnected', this.stopHandler);
        }

        read () {
            return this.queue.dequeue();
        }

        async stop () {
            this.characteristic.removeEventListener('characteristicvaluechanged', this.handler);
            this.characteristic.service.device.removeEventListener('gattserverdisconnected', this.stopHandler);

            this.handler = undefined;
            this.stopHandler = undefined;

            // TODO need to move start and stop notifications out of per chracteristic read
            try {
                await this.characteristic.stopNotifications();
            } catch (ex) {
                console.error(ex);
            }
            this.characteristic = undefined;

            // TODO mraj should we do anything with queue data if there are leftovers when stopping?
            this.queue.destroy();
            this.queue = undefined;
        }
    }

    const startCharacteristicNotification = function (characteristicRefnum, jsapi) {
        makeAsync(jsapi, async function () {
            const characteristic = refnumManager.getObject(characteristicRefnum);
            if (characteristic instanceof window.BluetoothRemoteGATTCharacteristic === false) {
                throw new Error(`Expected readValue to be invoked with a characteristicRefnum, instead got: ${characteristic}`);
            }

            // According to spec:
            // After notifications are enabled, the resulting value-change events won’t be delivered until after the current microtask checkpoint.
            // This allows a developer to set up handlers in the .then handler of the result promise.

            // TODO need to move start and stop notifications out of per chracteristic read
            await characteristic.startNotifications();
            const characteristicMonitor = new CharacteristicMonitor(characteristic);
            const characteristicMonitorRefnum = refnumManager.createRefnum(characteristicMonitor);
            return characteristicMonitorRefnum;
        });
    };

    const readCharacteristicNotification = function (characteristicMonitorRefnum, jsapi) {
        makeAsync(jsapi, async function () {
            const characteristicMonitor = refnumManager.getObject(characteristicMonitorRefnum);
            if (characteristicMonitor instanceof CharacteristicMonitor === false) {
                throw new Error(`Expected readCharacteristicNotification to be invoked with a characteristicMonitorRefnum, instead got: ${characteristicMonitor}`);
            }

            const data = await characteristicMonitor.read();
            return data;
        });
    };

    const stopCharacteristicNotification = function (characteristicMonitorRefnum, jsapi) {
        makeAsync(jsapi, async function () {
            const characteristicMonitor = refnumManager.getObject(characteristicMonitorRefnum);
            if (characteristicMonitor instanceof CharacteristicMonitor === false) {
                throw new Error(`Expected readCharacteristicNotification to be invoked with a characteristicMonitorRefnum, instead got: ${characteristicMonitor}`);
            }
            await characteristicMonitor.stop();
        });
    };

    window.webvi_web_bluetooth = {
        canonicalUUID,
        requestDevice,
        gattServerConnect,
        gattServerDisconnect,
        getPrimaryService,
        getCharacteristic,
        readValue,
        writeValue,
        startCharacteristicNotification,
        readCharacteristicNotification,
        stopCharacteristicNotification
    };
}());
