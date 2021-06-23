(function () {
    'use strict';
    const path = require('path');

    // This must be resolved from the Library component build output directory
    // Assume path similar to Builds/ApplicationComponentRoot/NodePath/Support/NodePath.js
    const componentDirectory = path.resolve(__dirname, '../../');
    const getComponentDirectory = function () {
        return componentDirectory;
    };

    const webviNodePath = require('@webvi-node/path');
    module.exports = {
        getComponentDirectory,
        ...webviNodePath
    };
}());
