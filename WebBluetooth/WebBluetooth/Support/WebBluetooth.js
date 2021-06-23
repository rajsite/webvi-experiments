(function () {
    'use strict';

    const deepMerge = function (target, ...args) {
        const isObject = function (obj) {
            return typeof obj === 'object' && obj !== null;
        };
        args.forEach(function (arg) {
            if (Array.isArray(arg)) {
                if (!Array.isArray(target)) {
                    throw new Error('Cannot merge an array onto a target non-array');
                }
                arg.forEach(item => target.push(item));
            } else if (isObject(arg)) {
                Object.keys(arg).forEach(function (prop) {
                    if (Array.isArray(arg[prop])) {
                        if (!Array.isArray(target[prop])) {
                            target[prop] = [];
                        }
                        deepMerge(target[prop], arg[prop]);
                    } else if (isObject(arg[prop])) {
                        if (!isObject(target[prop])) {
                            target[prop] = {};
                        }
                        deepMerge(target[prop], arg[prop]);
                    } else {
                        target[prop] = arg[prop];
                    }
                });
            } else {
                throw new Error('Cannot merge arg into target, arg must be an array or object to merge');
            }
        });
    };

    const validateWebBluetooth = function () {
        if (navigator.bluetooth === undefined) {
            throw new Error('Web Bluetooth not supported on this platform.');
        }
    };

    const validateWebBluetoothValue = function (value, expectedType) {
        validateWebBluetooth();

        // Debug logging
        const stackError = new Error();
        const stack = stackError.stack.split('\n');
        const currentStackPosition = stack.findIndex(val => val.indexOf(validateWebBluetoothValue.name) !== -1);
        const parentStackPosition = currentStackPosition + 1;
        console.log(`Current running ${stack[parentStackPosition]}`);

        // Workaround for https://github.com/daphtdazz/WebBLE/issues/27
        // loosen validation to let WebBLE run until the Web Bluetooth objects are exported
        if (expectedType === undefined) {
            return;
        }

        if (value instanceof expectedType === false) {
            throw new Error(`Expected reference to be an instance of ${expectedType.name}.`);
        }
    };

    const requestDevice = async function (filtersJSON, acceptAllDevices, optionalServiceUUIDsJSON) {
        validateWebBluetooth();
        // Dynamic JSON structure cannot be well-represented: https://github.com/WebBluetoothCG/web-bluetooth/issues/407
        const filters = JSON.parse(filtersJSON).map(filter => {
            const filterParts = filter.filterParts.map(filterPart => JSON.parse(filterPart));
            const filterPartsMerged = {};
            deepMerge(filterPartsMerged, ...filterParts);
            return filterPartsMerged;
        });
        const optionalServices = JSON.parse(optionalServiceUUIDsJSON);
        const options = {
            filters,
            acceptAllDevices,
            optionalServices
        };
        const device = await window.navigator.bluetooth.requestDevice(options);
        return device;
    };

    const getDeviceInformation = function (device) {
        const id = typeof device.id === 'string' ? device.id : '';
        const name = typeof device.name === 'string' ? device.name : '';
        const deviceInformation = {
            id,
            name
        };
        const deviceInformationJSON = JSON.stringify(deviceInformation);
        return deviceInformationJSON;
    };

    const gattServerConnect = async function (device) {
        validateWebBluetoothValue(device, window.BluetoothDevice);
        await device.gatt.connect();
    };

    const gattServerDisconnect = function (device) {
        validateWebBluetoothValue(device, window.BluetoothDevice);
        device.gatt.disconnect();
    };

    // For information about primary vs included services: https://webbluetoothcg.github.io/web-bluetooth/#information-model
    const getPrimaryService = async function (device, serviceName) {
        validateWebBluetoothValue(device, window.BluetoothDevice);
        const service = await device.gatt.getPrimaryService(serviceName);
        return service;
    };

    const getCharacteristic = async function (service, characteristicName) {
        validateWebBluetoothValue(service, window.BluetoothRemoteGATTService);
        const characteristic = await service.getCharacteristic(characteristicName);
        return characteristic;
    };

    const readValue = async function (characteristic) {
        validateWebBluetoothValue(characteristic, window.BluetoothRemoteGATTCharacteristic);
        const valueDataView = await characteristic.readValue();
        const value = new Uint8Array(valueDataView.buffer);
        return value;
    };

    const writeValue = async function (characteristic, value) {
        validateWebBluetoothValue(characteristic, window.BluetoothRemoteGATTCharacteristic);
        await characteristic.writeValue(value);
    };

    const startCharacteristicNotification = async function (characteristic) {
        // TODO disallow multiple startCharacteristicNotifications for the same characteristic?
        validateWebBluetoothValue(characteristic, window.BluetoothRemoteGATTCharacteristic);
        // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#The_ReadableStream_constructor
        let characteristicValueChangedHandler, gattServerDisconnectedHandler;
        const notificationStream = new ReadableStream({
            async start (controller) {
                await characteristic.startNotifications();
                // According to spec:
                // After notifications are enabled, the resulting value-change events won’t be delivered until after the current microtask checkpoint.
                // This allows a developer to set up handlers in the .then handler of the result promise.
                characteristicValueChangedHandler = () => {
                    controller.enqueue(new Uint8Array(characteristic.value.buffer));
                };
                // TODO controller close will allow exisiting values to be read. Should we instead kill the stream?
                gattServerDisconnectedHandler = () => {
                    controller.close();
                };
                characteristic.addEventListener('characteristicvaluechanged', characteristicValueChangedHandler);
                characteristic.service.device.addEventListener('gattserverdisconnected', gattServerDisconnectedHandler);
                // TODO add error case event listeners, see https://github.com/WebBluetoothCG/web-bluetooth/issues/500
            },
            async cancel () {
                characteristic.removeEventListener('characteristicvaluechanged', characteristicValueChangedHandler);
                characteristic.service.device.removeEventListener('gattserverdisconnected', gattServerDisconnectedHandler);
                await characteristic.stopNotifications();
            }
        });
        const notificationStreamReader = notificationStream.getReader();
        return notificationStreamReader;
    };

    const readCharacteristicNotification = async function (notificationStreamReader) {
        validateWebBluetoothValue(notificationStreamReader, window.ReadableStreamDefaultReader);
        const {value, done} = await notificationStreamReader.read();
        if (done) {
            // TODO make parseable errors to report the done state
            throw new Error('Notification stream done');
        }
        return value;
    };

    const stopCharacteristicNotification = async function (notificationStreamReader) {
        validateWebBluetoothValue(notificationStreamReader, window.ReadableStreamDefaultReader);
        await notificationStreamReader.cancel();
    };

    window.WebVIWebBluetooth = {
        requestDevice,
        getDeviceInformation,
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
