(function () {
    'use strict';
    const path = require('path');

    // TODO the nodejs semantics for path.resolve are much different than LabVIEW Build Path
    // should maybe implement the LabVIEW Build Path behavior?
    const resolve = function (base, relativePath) {
        const absolutePath = path.resolve(path.normalize(base), path.normalize(relativePath));
        return absolutePath;
    };

    module.exports = {
        resolve
    };
}());
