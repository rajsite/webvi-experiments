(function () {
    'use strict';

    const webvicliconfig = require('./webvicliconfig.js');
    const referenceManager = require('./referenceManager.js');
    const VireoNode = require('./VireoNode.js');

    const getReferenceManager = function () {
        return referenceManager;
    };

    const {getComponentPath, getClientPath, setClientPath, setComponentPath} = webvicliconfig;
    module.exports = {
        getReferenceManager,
        getComponentPath,
        getClientPath,
        setClientPath,
        setComponentPath,
        VireoNode
    };
}());
