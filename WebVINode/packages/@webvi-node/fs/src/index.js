(function () {
    'use strict';
    const fs = require('fs').promises;

    const readFile = async function (path) {
        const data = await fs.readFile(path, 'utf8');
        return data;
    };

    module.exports = {readFile};
}());
