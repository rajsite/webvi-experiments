(function () {
    'use strict';
    const WebVICLIRunner = require('./WebVICLIRunner.js');
    const sharedReferenceManager = require('./sharedReferenceManager.js');

    const getWorkingDirectory = function (applicationReference) {
        const webvicliRunner = sharedReferenceManager.getObject(applicationReference);
        if (webvicliRunner instanceof WebVICLIRunner === false) {
            throw new Error('Expected to receive a reference to the application');
        }
        return webvicliRunner.cwd;
    };

    module.exports = {getWorkingDirectory};
}());
