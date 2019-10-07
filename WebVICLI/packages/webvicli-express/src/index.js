(function () {
    'use strict';

    const express = require('express');
    const createVireoMiddleware = require('./createVireoMiddleware');
    const VireoMiddlewareRuntime = require('./VireoMiddlewareRuntime');
    module.exports = {
        express,
        createVireoMiddleware,
        VireoMiddlewareRuntime
    };
}());
