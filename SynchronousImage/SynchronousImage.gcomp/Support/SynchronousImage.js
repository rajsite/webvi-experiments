(function () {
    'use strict';

    const getObjectfit = function (stretch) {
        switch (stretch) {
        case 'No image scaling':
            return 'none';
        case 'Fit image in space':
            return 'contain';
        case 'Fill but maintain aspect ratio':
            return 'cover';
        case 'Stretch to fill space':
            return 'fill';
        default:
            throw new Error(`Invalid stretch mode: ${stretch}`);
        }
    };

    const create = function (container, stretch) {
        const objectFit = getObjectfit(stretch);
        const synchronousImage = document.createElement('canvas');
        synchronousImage.style.objectFit = objectFit;
        synchronousImage.style.height = '100%';
        synchronousImage.style.width = '100%';

        // Create a placeholder canvas buffer using width and height
        // Size will be updated by loaded images later
        synchronousImage.height = 100;
        synchronousImage.width = 100;
        const ctx = synchronousImage.getContext('2d');
        ctx.fillStyle = '#e9ebec';
        ctx.fillRect(0, 0, synchronousImage.width, synchronousImage.height);
        container.appendChild(synchronousImage);
        return synchronousImage;
    };

    const destroy = function (synchronousImage) {
        if (synchronousImage.parentNode !== null) {
            synchronousImage.parentNode.removeChild(synchronousImage);
        }
    };

    const load = function (img, url) {
        return new Promise((resolve, reject) => {
            let cleanup;
            const loadHandler = () => {
                resolve();
                cleanup();
            };
            const errorHandler = () => {
                reject(new Error(`Synchronous image failed to load url ${url}`));
                cleanup();
            };
            cleanup = () => {
                img.removeEventListener('load', loadHandler);
                img.removeEventListener('error', errorHandler);
            };
            img.addEventListener('load', loadHandler);
            img.addEventListener('error', errorHandler);
            img.src = url;
        });
    };

    const updateSourceByUrl = async function (synchronousImage, url) {
        const img = new Image();
        // Load image first so if fails and throws does not clear existing image
        await load(img, url);
        // Only check natural dimensions after image load
        synchronousImage.width = img.naturalWidth;
        synchronousImage.height = img.naturalHeight;
        const ctx = synchronousImage.getContext('2d');
        ctx.clearRect(0, 0, synchronousImage.width, synchronousImage.height);
        ctx.drawImage(img, 0, 0);
    };

    window.WebVISynchronousImage = {
        create,
        destroy,
        updateSourceByUrl
    };
}());
