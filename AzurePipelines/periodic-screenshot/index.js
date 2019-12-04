(async function () {
    'use strict';

    const path = require('path');
    const fs = require('fs').promises;
    const screenshotDesktop = require('screenshot-desktop');
    const mkdirp = require('mkdirp-promise');

    const intervalMs = 10000;
    const targetDir = path.join(process.cwd(), 'dist');
    await mkdirp(targetDir);

    console.log('screenshots saved to: ' + targetDir);
    setInterval(async function () {
        const buffer = await screenshotDesktop();
        const filename = 'screenshot_' + Date.now() + '.jpg';
        const filepath = path.join(targetDir, filename);
        await fs.writeFile(filepath, buffer);
    }, intervalMs);
}());
