(function () {
    'use strict';

    // Workaround for https://github.com/daphtdazz/WebBLE/issues/22
    // Console function list from niSupport.js
    ['error', 'warn', 'debug', 'info', 'group', 'groupEnd'].forEach(function (name) {
        if (!console[name]) {
            console[name] = console.log;
        }
    });

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

    const validateWebBluetooth = function () {
        if (navigator.bluetooth === undefined) {
            throw new Error('Web Bluetooth not supported on this platform.');
        }
    };

    const validateWebBluetoothAndReference = function (reference, expectedType) {
        validateWebBluetooth();
        const result = referenceManager.getObject(reference);
        if (result === undefined) {
            throw new Error('Invalid reference.');
        }

        // Workaround for https://github.com/daphtdazz/WebBLE/issues/27
        // loosen validation to let WebBLE run until the Web Bluetooth objects are exported
        if (expectedType === undefined) {
            return result;
        }

        if (result instanceof expectedType === false) {
            throw new Error(`Expected reference to be an instance of ${expectedType.name}.`);
        }
        return result;
    };

    const gattServerMonitorInstances = new Map();
    class GATTServerMonitor {
        static lookupDeviceGattServerMonitor (device) {
            const gattServerMonitor = gattServerMonitorInstances.get(device);
            if (gattServerMonitor === undefined) {
                throw new Error('Unable to find GATT Server Monitor for device. Make sure to call Gatt Server connect.');
            }
            return gattServerMonitor;
        }

        static registerDeviceResource (device, reference) {
            const gattServerMonitor = GATTServerMonitor.lookupDeviceGattServerMonitor(device);
            gattServerMonitor.registerResource(reference);
        }

        constructor (device) {
            if (gattServerMonitorInstances.has(device)) {
                throw new Error('Device gatt server is already being monitored.');
            }
            this._device = device;
            this._deviceResources = [];
            this._setDisconnected = undefined;
            this._disconnected = new Promise((resolve, reject) => {
                this._setDisconnected = () => {
                    reject(new Error('GATT Server disconnected.'));
                };
            });
            // Without having a default handler for the promise rejection Chrome seems to have intermittancy on future gatt.connect calls
            this._disconnected.catch(() => {
                // create a default noop handler for the disconnected rejection to prevent unhandled promise rejection console errors
            });
            this._disconnectedHandler = () => {
                this.disconnect();
            };
            this._device.addEventListener('gattserverdisconnected', this._disconnectedHandler);
            gattServerMonitorInstances.set(this._device, this);
        }

        // Track services, characteristics, and descriptors because become invalid on disconnect: https://webbluetoothcg.github.io/web-bluetooth/#persistence
        registerResource (reference) {
            this._deviceResources.push(reference);
        }

        connect () {
            return this._device.gatt.connect();
        }

        disconnect () {
            gattServerMonitorInstances.delete(this._device);
            this._device.removeEventListener('gattserverdisconnected', this._disconnectedHandler);
            this._disconnectedHandler = undefined;
            this._setDisconnected();
            this._deviceResources.forEach(refererence => referenceManager.closeReference(refererence));
            this._deviceResources = undefined;
            try {
                this._device.gatt.disconnect();
            } catch (ex) {
                console.error(ex);
            }
            this._device = undefined;
        }

        disconnected () {
            return this._disconnected;
        }
    }

    const requestDevice = async function (filtersJSON, acceptAllDevices, optionalServiceUUIDsJSON) {
        validateWebBluetooth();
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

    const gattServerConnect = async function (deviceReference) {
        console.log('connect');
        const device = validateWebBluetoothAndReference(deviceReference, window.BluetoothDevice);
        const gattServerMonitor = new GATTServerMonitor(device);
        await gattServerMonitor.connect();
        console.log('connect end');
    };

    const gattServerDisconnect = function (deviceReference) {
        console.log('disconnect');
        const device = validateWebBluetoothAndReference(deviceReference, window.BluetoothDevice);
        const gattServerMonitor = GATTServerMonitor.lookupDeviceGattServerMonitor(device);
        gattServerMonitor.disconnect();
        console.log('disconnect end');
    };

    // For information about primary vs included services: https://webbluetoothcg.github.io/web-bluetooth/#information-model
    const getPrimaryService = async function (deviceReference, serviceName) {
        console.log('primary service');
        const device = validateWebBluetoothAndReference(deviceReference, window.BluetoothDevice);
        const service = await device.gatt.getPrimaryService(serviceName);
        const serviceReference = referenceManager.createReference(service);
        GATTServerMonitor.registerDeviceResource(device, serviceReference);
        console.log('primary service end');
        return serviceReference;
    };

    const getCharacteristic = async function (serviceReference, characteristicName) {
        console.log('get characteristic');
        const service = validateWebBluetoothAndReference(serviceReference, window.BluetoothRemoteGATTService);
        const characteristic = await service.getCharacteristic(characteristicName);
        const characteristicReference = referenceManager.createReference(characteristic);
        GATTServerMonitor.registerDeviceResource(service.device, characteristicReference);
        console.log('get characteristic end');
        return characteristicReference;
    };

    const readValue = async function (characteristicReference) {
        console.log('read value');
        const characteristic = validateWebBluetoothAndReference(characteristicReference, window.BluetoothRemoteGATTCharacteristic);
        const valueDataView = await characteristic.readValue();
        // DataView documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
        console.log('read value end');
        return new Uint8Array(valueDataView.buffer);
    };

    const writeValue = async function (characteristicReference, value) {
        const characteristic = validateWebBluetoothAndReference(characteristicReference, window.BluetoothRemoteGATTCharacteristic);
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
            this._characteristic = characteristic;
            this._queue = new DataQueue();
            // According to spec:
            // After notifications are enabled, the resulting value-change events won’t be delivered until after the current microtask checkpoint.
            // This allows a developer to set up handlers in the .then handler of the result promise.
            this._handler = (evt) => {
                this._queue.enqueue(new Uint8Array(evt.target.value.buffer));
            };
            this._characteristic.addEventListener('characteristicvaluechanged', this.handler);
        }

        get characteristic () {
            return this._characteristic;
        }

        read () {
            return this._queue.dequeue();
        }

        async start () {
            await this._characteristic.startNotifications();
        }

        async stop () {
            this._characteristic.removeEventListener('characteristicvaluechanged', this.handler);
            this._handler = undefined;

            try {
                await this._characteristic.stopNotifications();
            } catch (ex) {
                console.error(ex);
            }
            this._characteristic = undefined;

            // TODO mraj should we do anything with queue data if there are leftovers when stopping?
            this._queue.destroy();
            this._queue = undefined;
        }
    }

    const startCharacteristicNotification = async function (characteristicReference) {
        const characteristic = validateWebBluetoothAndReference(characteristicReference, window.BluetoothRemoteGATTCharacteristic);
        const characteristicMonitor = new CharacteristicMonitor(characteristic);
        const characteristicMonitorReference = referenceManager.createReference(characteristicMonitor);
        GATTServerMonitor.registerResource(characteristic.service.device, characteristicMonitorReference);
        await characteristicMonitor.start();
        return characteristicMonitorReference;
    };

    const readCharacteristicNotification = async function (characteristicMonitorReference) {
        const characteristicMonitor = validateWebBluetoothAndReference(characteristicMonitorReference, CharacteristicMonitor);
        const gattServerMonitor = GATTServerMonitor.lookupDeviceGattServerMonitor(characteristicMonitor.characteristic.service.device);
        const data = await Promise.race([
            gattServerMonitor.disconnected(),
            characteristicMonitor.read()
        ]);
        return data;
    };

    const stopCharacteristicNotification = async function (characteristicMonitorReference) {
        const characteristicMonitor = validateWebBluetoothAndReference(characteristicMonitorReference, CharacteristicMonitor);
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
