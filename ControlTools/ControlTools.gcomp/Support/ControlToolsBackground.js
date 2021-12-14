(function () {
    'use strict';

    const performExtendBackground = () => {
        const webAppElements = document.querySelectorAll('ni-web-application');
        if (webAppElements.length !== 1) {
            throw new Error(`Expected a single ni-web-application element, found: ${webAppElements.length}`);
        }
        const [webAppElement] = webAppElements;
        // Runs before the custom element has initialized so read the HTML value
        const isInBrowser = webAppElement.getAttribute('location') === 'BROWSER';
        // When running in the editor the body background has margins outside the panel that
        // is controlled by the editor so we skip extending the background
        if (isInBrowser === false) {
            return;
        }
        // When running in browser set a class on body to adjust styles
        document.body.classList.add('webvi-control-tools-background');
        const frontPanels = document.querySelectorAll('ni-front-panel');
        if (frontPanels.length !== 1) {
            throw new Error(`Expected a single ni-front-panel to query background color, found: ${frontPanels.length}`);
        }
        const [frontPanel] = frontPanels;
        const background = window.getComputedStyle(frontPanel).getPropertyValue('--ni-background');
        if (background === '') {
            throw new Error('The --ni-background css property is not defined for ni-front-panel');
        }
        document.body.style.setProperty('--webvi-control-tools-background', background);
    };

    const ready = function (callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('readystatechange', function readyStateChangeHandler () {
                document.removeEventListener('readystatechange', readyStateChangeHandler);
                callback();
            });
        } else {
            callback();
        }
    };

    let loadException;

    const extendBackground = () => {
        if (loadException !== undefined) {
            throw loadException;
        }
    };

    ready(() => {
        try {
            performExtendBackground();
        } catch (ex) {
            loadException = ex;
        }
    });

    window.WebVIControlToolsBackground = {extendBackground};
}());
