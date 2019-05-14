/* globals module: true, require: true */
(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('five'));
    } else {
        factory(root.five);
    }
}(this, function (five) {
    'use strict';
    const commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    commonjsGlobal.WebVIFive = {
        five: function () {
            return five();
        }
    };
}));
