(function () {
    'use strict';
    const refnum = window.customInputType.create('#mycontainer', JSON.stringify([
        {
            name: 'type',
            value: 'date'
        }
    ]));
    document.getElementById('destroy').addEventListener('click', () => window.customInputType.stopEvents(refnum));
    (async function getEvent () {
        const val = await window.customInputType.waitForValueChangeEvent(refnum);
        console.log(val);
        await getEvent();
    }());
}());
