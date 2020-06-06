(function () {
    'use strict';

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
        let characteristicValueChangedHandler, serviceRemovedHandler, gattServerDisconnectedHandler;
        const notificationStream = new ReadableStream({
            async start (controller) {
                await characteristic.startNotifications();
                // According to spec:
                // After notifications are enabled, the resulting value-change events won’t be delivered until after the current microtask checkpoint.
                // This allows a developer to set up handlers in the .then handler of the result promise.
                characteristicValueChangedHandler = () => controller.enqueue(characteristic.value.buffer);
                // TODO controller close will allow exisiting values to be read. Should we instead kill the stream?
                serviceRemovedHandler = () => controller.close();
                gattServerDisconnectedHandler = () => controller.close();
                characteristic.addEventListener('characteristicvaluechanged', characteristicValueChangedHandler);
                characteristic.service.addEventListener('serviceremoved', serviceRemovedHandler);
                characteristic.service.device.addEventListener('gattserverdisconnected', gattServerDisconnectedHandler);
                // TODO add error case event listeners, see https://github.com/WebBluetoothCG/web-bluetooth/issues/500
            },
            async cancel () {
                characteristic.removeEventListener('characteristicvaluechanged', characteristicValueChangedHandler);
                characteristic.service.removeEventListener('serviceremoved', serviceRemovedHandler);
                characteristic.service.device.removeEventListener('gattserverdisconnected', gattServerDisconnectedHandler);
                await characteristic.stopNotifications();
            }
        });
        const notificationStreamReader = notificationStream.getReader();
        return notificationStreamReader;
    };

    const readCharacteristicNotification = async function (notificationStreamReader) {
        validateWebBluetoothValue(notificationStreamReader, window.ReadableStream);
        const value = await notificationStreamReader.read();
        return value;
    };

    const stopCharacteristicNotification = async function (notificationStreamReader) {
        validateWebBluetoothValue(notificationStreamReader, window.ReadableStream);
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
