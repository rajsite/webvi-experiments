(function () {
    'use strict';

    const createCanvas = function (placeholder) {
        const canvasElement = document.createElement('canvas');
        placeholder.style.border = 'var(--ni-border)';
        placeholder.innerHTML = '';
        placeholder.appendChild(canvasElement);

        const fabricCanvas = new window.fabric.Canvas(canvasElement);
        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            const {height, width} = entry.contentRect;
            fabricCanvas.setDimensions({
                height,
                width
            });
            fabricCanvas.renderAll();
        });
        resizeObserver.observe(placeholder);

        const rect = new window.fabric.Rect({
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red',
        });
        fabricCanvas.add(rect);
        return fabricCanvas;
    };

    window.WebVIFabric = {
        createCanvas
    };
}());
