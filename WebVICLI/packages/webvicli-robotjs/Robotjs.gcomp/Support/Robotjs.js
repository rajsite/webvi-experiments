(function () {
    'use strict';
    const robot = require('robotjs');

    const moveMouse = function (xPos, yPos) {
        robot.moveMouse(xPos, yPos);
    };

    const getScreenSize = function () {
        const {width, height} = robot.getScreenSize();
        return JSON.stringify({
            width,
            height
        });
    };

    global.WebVIRobotjs = {
        getScreenSize,
        moveMouse
    };
}());
