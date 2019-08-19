(function () {
    'use strict';

    const path = require('path');
    const xhr2 = require('xhr2');

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

    const getReferenceManager = function () {
        return referenceManager;
    };

    const applicationPaths = {
        componentPath: undefined,
        clientPath: undefined
    };

    const setComponentPath = function (path) {
        if (applicationPaths.componentPath === undefined) {
            applicationPaths.componentPath = path;
        } else {
            throw new Error('Component path already configured');
        }
    };

    const getComponentPath = function () {
        if (applicationPaths.componentPath === undefined) {
            throw new Error('Component path not configured');
        }
        return applicationPaths.componentPath;
    };

    const setClientPath = function (path) {
        if (applicationPaths.clientPath === undefined) {
            applicationPaths.clientPath = path;
        } else {
            throw new Error('Client path already configured');
        }
    };

    const getClientPath = function () {
        return applicationPaths.clientPath;
    };

    class VireoInstance {
        constructor (vireo, viName) {
            this._vireo = vireo;
            this._viName = viName;
        }

        getVireo () {
            return this._vireo;
        }

        getVIName () {
            return this._viName;
        }

        enqueueVI () {
            this._vireo.eggShell.loadVia(`enqueue(${this._viName})`);
        }
    }

    const createVireoInstance = async function (viaWithEnqueue) {
        const componentPath = getComponentPath();
        const vireoHelpers = require(path.resolve(componentPath, 'ni-webvi-resource-v0/node_modules/vireo/dist/wasm32-unknown-emscripten/release/vireo.min.js'));
        const enqueueRegex = /^enqueue\s*\((\S*)\)$/m;
        const via = viaWithEnqueue.replace(enqueueRegex, '');
        const viName = viaWithEnqueue.match(enqueueRegex)[1];
        const vireo = await vireoHelpers.createInstance();
        vireo.httpClient.setXMLHttpRequestImplementation(xhr2);
        const notSupportedError = () => {
            throw new Error('Unsupported on this target');
        };
        vireo.javaScriptInvoke.registerInternalFunctions({
            ControlReference_GetControlObject: notSupportedError,
            PropertyNode_PropertyRead: notSupportedError,
            PropertyNode_PropertyWrite: notSupportedError,
            OneButtonDialog: notSupportedError,
            TwoButtonDialog: notSupportedError,
            LogLabVIEWError: function (ignoreReturnValueRef, statusValueRef, codeValueRef, sourceValueRef) {
                const code = vireo.eggShell.readDouble(codeValueRef);
                const source = vireo.eggShell.readString(sourceValueRef);
                throw new Error(`LabVIEW error ${code} occured at ${source === '' ? 'unknown location' : source}`);
            },
            InvokeControlFunction: notSupportedError
        });
        vireo.eggShell.loadVia(via);
        const vireoInstance = new VireoInstance(vireo, viName);
        return vireoInstance;
    };

    module.exports = {
        getReferenceManager,
        setComponentPath,
        getComponentPath,
        setClientPath,
        getClientPath,
        createVireoInstance
    };
}());
