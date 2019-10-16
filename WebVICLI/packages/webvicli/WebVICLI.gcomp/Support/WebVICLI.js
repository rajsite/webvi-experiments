(function () {
    'use strict';
    const WebVICLI = require('webvicli').WebVICLI;
    const path = require('path');
    // This must be resolved from the Library component build output directory
    // Assume path similar to Builds/ApplicationComponentRoot/WebVICLI/Support/WebVICLI.js
    const componentDirectory = path.resolve(__dirname, '../../');
    const getComponentDirectory = function () {
        return componentDirectory;
    };

    module.exports = {
        ...WebVICLI,
        getComponentDirectory
    };
}());
