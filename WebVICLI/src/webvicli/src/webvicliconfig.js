(function () {
    'use strict';
    console.log('!!!!!!!!! ' + __filename);
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

    module.exports = {
        setComponentPath,
        getComponentPath,
        setClientPath,
        getClientPath
    };
}());
