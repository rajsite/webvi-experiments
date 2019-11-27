(function () {
    'use strict';

    const insertHtmlBeforeFrontPanelWrapper = function (htmlToInsert) {
        const elements = document.querySelectorAll('.ni-front-panel-wrapper');
        if (elements.length !== 1) {
            throw new Error(`Expected to find one ni-front-panel-wrapper but found ${elements.length}`);
        }
        const frontPanelWrapper = elements[0];
        frontPanelWrapper.insertAdjacentHTML('beforebegin', htmlToInsert);
    };

    window.WebVIPanelManipulation = {insertHtmlBeforeFrontPanelWrapper};
}());
