(function () {
    'use strict';

    const glob = require('glob');
    const htmlRequire = require('./htmlRequire.js');
    const ReferenceManager = require('./referenceManager.js');
    const VireoNode = require('./VireoNode.js');
    const WebVICLIRunner = require('./WebVICLIRunner.js');
    const sharedReferenceManager = new ReferenceManager();
    module.exports = {
        glob,
        htmlRequire,
        ReferenceManager,
        sharedReferenceManager,
        VireoNode,
        WebVICLIRunner
    };
}());
