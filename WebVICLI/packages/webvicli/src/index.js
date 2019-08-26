(function () {
    'use strict';

    const webvicliconfig = require('./webvicliconfig.js');
    const referenceManager = require('./referenceManager.js');
    const VireoNode = require('./VireoNode.js');
    const WebVICLIRunner = require('./WebVICLIRunner.js');

    const getReferenceManager = function () {
        return referenceManager;
    };

    const {getComponentPath, getClientPath} = webvicliconfig;
    module.exports = {
        getReferenceManager,
        getComponentPath,
        getClientPath,
        VireoNode,
        WebVICLIRunner
    };
}());
