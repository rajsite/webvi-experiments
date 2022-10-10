(function () {
    'use strict';

    const createCanvas = function (placeholder) {
        const canvasElement = document.createElement('canvas');
        canvasElement.style.height = '100%';
        canvasElement.style.width = '100%';
        canvasElement.height = 300;
        canvasElement.width = 300;
        placeholder.innerHTML = '';
        placeholder.appendChild(canvasElement);
        const canvas = new window.fabric.Canvas(canvasElement);
        const rect = new window.fabric.Rect({
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red',
        });
        canvas.add(rect);
        return canvas;
    };

    window.WebVIFabric = {
        createCanvas
    };
}());
