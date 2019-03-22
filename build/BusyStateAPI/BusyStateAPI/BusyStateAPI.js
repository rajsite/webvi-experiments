(function () {
    'use strict';

    const busyElement = document.createElement('dialog');
    // Prevent the dialog from being cancelled by pressing the escape key
    busyElement.addEventListener('cancel', (evt) => evt.preventDefault());
    busyElement.classList.add('busy-state-dialog');

    if (window.dialogPolyfill !== undefined) {
        window.dialogPolyfill.registerDialog(busyElement);
    }

    const setBusy = function () {
        if (document.body.contains(busyElement)) {
            throw new Error('Panel already in busy state, cannot set busy');
        }

        document.body.appendChild(busyElement);
        busyElement.showModal();
    };

    const unsetBusy = function () {
        if (!document.body.contains(busyElement)) {
            throw new Error('Panel not in busy state, cannot unset busy');
        }
        busyElement.close();
        busyElement.remove();
    };

    window.busyStateAPI = {
        setBusy,
        unsetBusy
    };
}());
