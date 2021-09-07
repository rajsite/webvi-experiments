# CKEditor5

This example is archived and **not maintained**.

## History

- This library started as a way to integrate CKEditor5 in WebVIs.
- During development came to realize that the CKEditor5 license may not be compatible with the goals of this repo (to make examples usable by as many WebVI users as possible).
- All CKEditor5 source was removed and the example wrappers (this project) are available under MIT license.
- This example can be used by those that wish to use the CKEditor5 Commercial / Open Source license, but will not be maintained itself.

## Overview

- CKEditor5 is licensed under a [GPL license](https://ckeditor.com/legal/ckeditor-oss-license/) with options for commercial licenses. The CKEditor author has [expressed intent about the goal of the open source license](https://github.com/ckeditor/ckeditor5/issues/991#issuecomment-389812759).
- My interpretation is that to include CKEditor5, this project would need to be licensed as GPL which is not a goal of this project.
- As such removed the source / binaries for CKEditor5 itself, this CKEditor5 example remains for those who wish to utilize the CKEditor5 under its license terms (commercial or GPL open source).

## Installing CKEditor5 binaries

If you wish to use the CKEditor5 binaries with this example you can perform the following steps:

1. Install a recent LTS version of [node.js](https://nodejs.org/en/download/).
2. Open a command-line window and navigate to the `CKEditor5.gcomp/Support` directory.
3. From inside the `Support` directory run the `npm install` command from the command-line.
4. Open the `CKEditor5.gcomp/Support/CKEditor5.jsli` file to see which .js files are necessary, include them in the CKEditor5.gcomp.
