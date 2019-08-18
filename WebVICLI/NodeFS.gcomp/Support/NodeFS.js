(function () {
    'use strict';
    const fs = require('fs').promises;

    const readFile = async function (path) {
        const data = await fs.readFile(path, 'utf8');
        return data;
    };

    global.WebVINodeFS = {readFile};
}());

// (function () {
//     'use strict';

//     module.exports = function (config) {
//         const fs = require('fs').promises;

//         const readFile = async function (path) {
//             const data = await fs.readFile(path, 'utf8');
//             return data;
//         };
//         config.getClientPath();
//         config.getServerPath();
//         config.setWebVIGlobal('WebVINodeFS', {readFile});
//     };
// }());
