(function () {
    'use strict';

    const eventOccurence = function (element, eventName) {
        return new Promise(function (resolve) {
            const handler = element.addEventListener(eventName, () => {
                element.removeEventListener(eventName, handler);
                resolve();
            });
        });
    };

    class ReferenceManager {
        constructor () {
            this._nextReference = 1;
            this.references = new Map();
        }

        createReference (obj) {
            const reference = this._nextReference;
            this._nextReference += 1;
            this.references.set(reference, obj);
            return reference;
        }

        getObject (reference) {
            return this.references.get(reference);
        }

        closeReference (reference) {
            this.references.delete(reference);
        }
    }
    const referenceManager = new ReferenceManager();

    const requestDevice = async function (selector, eventName, filtersJSON, acceptAllDevices, optionalServiceUUIDsJSON) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Exactly one element must match the provided selector: ${selector}. Instead found the following number: ${elements.length}.`);
        }
        const element = elements[0];

        await eventOccurence(element, eventName);

        const filters = JSON.parse(filtersJSON).map(filter => {
            return filter.filterSettings.map(function ({name, settingJSON}) {
                const settingRaw = JSON.parse(settingJSON);
                const setting = settingRaw.single_property_to_unflatten === undefined ? settingRaw : settingRaw.single_property_to_unflatten;
                return {
                    name,
                    setting
                };
            }).reduce(function (filter, {name, setting}) {
                filter[name] = setting;
                return filter;
            }, {});
        });
        const optionalServices = JSON.parse(optionalServiceUUIDsJSON);
        const options = {
            filters,
            acceptAllDevices,
            optionalServices
        };
        const device = await window.navigator.bluetooth.requestDevice(options);
        const reference = referenceManager.createReference(device);
        const id = typeof device.id === 'string' ? device.id : '';
        const name = typeof device.name === 'string' ? device.name : '';
        const deviceInformation = {
            reference,
            id,
            name
        };
        return JSON.stringify(deviceInformation);
    };

    // TODO maybe should have gattServer and gattServerConnect / gattServerDisconnect? Seems strange to ask device to disconnect gatt server instead of server itself
    const gattServerConnect = async function (deviceRefnum) {
        const device = referenceManager.getObject(deviceRefnum);
        if (device instanceof window.BluetoothDevice === false) {
            throw new Error(`Expected gattServerConnect to be invoked with a deviceRefnum, instead got: ${device}`);
        }
        const gattServer = await device.gatt.connect();
        const gattServerRefnum = referenceManager.createReference(gattServer);
        return gattServerRefnum;
    };

    const gattServerDisconnect = function (deviceRefnum) {
        const device = referenceManager.getObject(deviceRefnum);
        if (device instanceof window.BluetoothDevice === false) {
            throw new Error(`Expected gattServerDisconnect to be invoked with a deviceRefnum, instead got: ${device}`);
        }

        // TODO services, characteristics, and descriptors become invalid on disconnect: https://webbluetoothcg.github.io/web-bluetooth/#persistence
        // Maybe we should track and auto clean-up those references?
        device.gatt.disconnect();
    };

    // For information about primary vs included services: https://webbluetoothcg.github.io/web-bluetooth/#information-model
    const getPrimaryService = async function (gattServerRefnum, serviceName) {
        const gattServer = referenceManager.getObject(gattServerRefnum);
        if (gattServer instanceof window.BluetoothRemoteGATTServer === false) {
            throw new Error(`Expected getPrimaryService to be invoked with a gattServerRefnum, instead got: ${gattServer}`);
        }

        const service = await gattServer.getPrimaryService(serviceName);
        const serviceRefnum = referenceManager.createReference(service);
        return serviceRefnum;
    };

    const getCharacteristic = async function (serviceRefnum, characteristicName) {
        const service = referenceManager.getObject(serviceRefnum);
        if (service instanceof window.BluetoothRemoteGATTService === false) {
            throw new Error(`Expected getCharacteristic to be invoked with a serviceRefnum, instead got: ${service}`);
        }

        const characteristic = await service.getCharacteristic(characteristicName);
        const characteristicRefnum = referenceManager.createReference(characteristic);
        return characteristicRefnum;
    };

    const readValue = async function (characteristicRefnum) {
        const characteristic = referenceManager.getObject(characteristicRefnum);
        if (characteristic instanceof window.BluetoothRemoteGATTCharacteristic === false) {
            throw new Error(`Expected readValue to be invoked with a characteristicRefnum, instead got: ${characteristic}`);
        }

        const valueDataView = await characteristic.readValue();
        // DataView documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
        return new Uint8Array(valueDataView.buffer);
    };

    const writeValue = async function (characteristicRefnum, value) {
        const characteristic = referenceManager.getObject(characteristicRefnum);
        if (characteristic instanceof window.BluetoothRemoteGATTCharacteristic === false) {
            throw new Error(`Expected readValue to be invoked with a characteristicRefnum, instead got: ${characteristic}`);
        }

        await characteristic.writeValue(value);
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

    const startCharacteristicNotification = async function (characteristicRefnum) {
        const characteristic = referenceManager.getObject(characteristicRefnum);
        if (characteristic instanceof window.BluetoothRemoteGATTCharacteristic === false) {
            throw new Error(`Expected readValue to be invoked with a characteristicRefnum, instead got: ${characteristic}`);
        }

        // According to spec:
        // After notifications are enabled, the resulting value-change events won’t be delivered until after the current microtask checkpoint.
        // This allows a developer to set up handlers in the .then handler of the result promise.

        // TODO need to move start and stop notifications out of per chracteristic read
        await characteristic.startNotifications();
        const characteristicMonitor = new CharacteristicMonitor(characteristic);
        const characteristicMonitorRefnum = referenceManager.createReference(characteristicMonitor);
        return characteristicMonitorRefnum;
    };

    const readCharacteristicNotification = async function (characteristicMonitorRefnum) {
        const characteristicMonitor = referenceManager.getObject(characteristicMonitorRefnum);
        if (characteristicMonitor instanceof CharacteristicMonitor === false) {
            throw new Error(`Expected readCharacteristicNotification to be invoked with a characteristicMonitorRefnum, instead got: ${characteristicMonitor}`);
        }

        const data = await characteristicMonitor.read();
        return data;
    };

    const stopCharacteristicNotification = async function (characteristicMonitorRefnum) {
        const characteristicMonitor = referenceManager.getObject(characteristicMonitorRefnum);
        if (characteristicMonitor instanceof CharacteristicMonitor === false) {
            throw new Error(`Expected readCharacteristicNotification to be invoked with a characteristicMonitorRefnum, instead got: ${characteristicMonitor}`);
        }
        await characteristicMonitor.stop();
    };

    window.WebVIWebBluetooth = {
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
