(function () {
    'use strict';
    const refnum = window.customInputControl.createAndListenForChange('#mycontainer', JSON.stringify([
        {
            name: 'type',
            value: 'date'
        }
    ]));
    document.getElementById('destroy').addEventListener('click', () => window.customInputControl.stopListeningForChange(refnum));
    (async function getEvent () {
        const val = await window.customInputControl.waitForChange(refnum);
        console.log(val);
        await getEvent();
    }());
}());
