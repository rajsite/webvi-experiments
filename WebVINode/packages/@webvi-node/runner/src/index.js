(function () {
    'use strict';

    const htmlRequire = require('./htmlRequire.js');
    const ReferenceManager = require('./referenceManager.js');
    const VireoNode = require('./VireoNode.js');
    const WebVINodeRunner = require('./WebVINodeRunner.js');
    const sharedReferenceManager = require('./sharedReferenceManager.js');
    module.exports = {
        htmlRequire,
        ReferenceManager,
        sharedReferenceManager,
        VireoNode,
        WebVINodeRunner
    };
}());
