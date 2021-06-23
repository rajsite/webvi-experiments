(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('five'));
    } else {
        root.WebVIFive = factory(root.five);
    }
}(this, function (five) {
    'use strict';
    return {
        five: function () {
            return five();
        }
    };
}));
