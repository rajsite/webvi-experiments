(function () {
    'use strict';

    const ReferenceManager = require('./referenceManager.js');
    const sharedReferenceManager = new ReferenceManager();
    module.exports = sharedReferenceManager;
}());
