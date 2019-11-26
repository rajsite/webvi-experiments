(function () {
    'use strict';

    // Restore any previously imported jquery versions
    const jqueryInstance = window.$.noConflict(true);

    const loadBootstrap = function () {
        // Intentionally empty
        // Need a node to call so bootstrap dependencies are loaded
    };

    window.WebVIBootstrap = {
        jqueryInstance,
        loadBootstrap
    };
}());
