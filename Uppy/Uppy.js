// Template from http://www.ni.com/documentation/en/labview-web-module/3.0/manual/prepare-your-js-code/

(function () {
    'use strict';

    // Loads the entire file in memory and returns as a Uint8Array
    const fileRead = async function (file) {
        return new Promise(function (resolve, reject) {
            const fileReader = new FileReader();
            const loadendHandler = function () {
                fileReader.removeEventListener('loadend', loadendHandler);
                if (fileReader.error) {
                    reject(fileReader.error);
                } else {
                    const result = new Uint8Array(fileReader.result);
                    resolve(result);
                }
            };

            fileReader.addEventListener('loadend', loadendHandler);
            fileReader.readAsArrayBuffer(file);
        });
    };

    // Lets a user pick a single file either from disk or by taking a picture from a webcam
    // Returns a File or Blob object representation
    const userFileSelection = function () {
        return new Promise(function (resolve, reject) {
            const Uppy = window.Uppy;
            const Dashboard = Uppy.Dashboard;
            const Webcam = Uppy.Webcam;
            let currentTimeout = undefined;

            // For more options to use with Core: https://uppy.io/docs/uppy/#Options
            const uppy = Uppy.Core({
                restrictions: {
                    maxNumberOfFiles: 1
                },
                onBeforeUpload: function (uppyFiles) {
                    // Configured for single file so pick that
                    const files = Object.keys(uppyFiles).map((key) => uppyFiles[key].data);
                    const file = files[0];

                    // Clean-up the dialog and uppy state
                    uppy.getPlugin('Dashboard').closeModal();
                    clearTimeout(currentTimeout);
                    currentTimeout = undefined;
                    uppy.close();

                    // Return the selected file / blob
                    resolve(file);
                    return false;
                }
            });

            // For more options to use with Webcam: https://uppy.io/docs/webcam/#Options
            uppy.use(Webcam, {
                modes: ['picture']
            });

            // For more options to use with Dashboard: https://uppy.io/docs/dashboard/#Options
            uppy.use(Dashboard, {
                plugins: ['Webcam'],
                trigger: null
            });

            // Open the dashboard and wait for selection or cancel
            uppy.getPlugin('Dashboard').openModal();

            // Poll and check if the dashboard is still open
            // Does not appear to be an event to notify if the dashboard is closed
            // See issue: https://github.com/transloadit/uppy/issues/1208
            // Actually switch to onRequestCloseModal: () => this.closeModal()
            (function checkDialog () {
                if (uppy.getPlugin('Dashboard').isModalOpen()) {
                    currentTimeout = setTimeout(checkDialog, 0);
                } else {
                    // If modal closed and timeout undefined then must have closed successfully last tick
                    if (currentTimeout !== undefined) {
                        reject(new Error('No file selected'));
                    }
                }
            }());
        });
    };

    // Asks the user for a file, loads the contents in memory, and returns it as a Uint8Array
    // Relies on NXG 3.1 Promise support for async JavaScript
    window.getUserFile = async function () {
        const file = await userFileSelection();
        const uint8Array = await fileRead(file);
        return uint8Array;
    };
}());
