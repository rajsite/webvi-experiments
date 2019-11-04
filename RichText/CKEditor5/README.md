# CKEditor 5

This example is archived and not maintained

## History

- This library started as a way to integrate CKEditor in LabVIEW NXG WebVI applications.
- During development came to realize that the CKEditor 5 license may not be compatible with the goals of this repo (to make examples usable by as many WebVI users as possible).
- All CKEditor source was removed and the example wrappers are available under MIT license.
- This example can be used by those that wish to use the CKEditor Commercial / Open Source license, but will not be mainted itself.

## Overview

- CKEditor is licensed under a dual GPL + commercial license. The CKEditor author has [expressed intent about the goal of the open source license](https://github.com/ckeditor/ckeditor5/issues/991#issuecomment-389812759).
- My interpretation is that to include CKEditor this project would need to be licensed as GPL which is not a goal of this project.
- As such removed the source / binaries for CKEditor itself, the CKEditor example remains for those who wish to utilize the CKEditor under its license terms (commercial or GPL open source).

## Installing CKEditor binaries

If you wish to use the CKEditor binaries with this example you can perform the following steps:

1. Install a recent LTS version of the node.js application.
2. Open a command-line window and navigate to the `CKEditor.gcomp/Support` directory.
3. From inside the `Support` directory run the `npm install` command.
4. Open the CKEditor.jsli file to see which .js and .css files are necessary, include them in the component.
