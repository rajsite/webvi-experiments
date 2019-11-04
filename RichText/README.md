# RichText examples

Shows examples of different editors, some concerns:

## Quill
- Seems robust and has a large userbase
- Concerned that [Quill.js may not be under active development](https://github.com/quilljs/quill/issues/2619).

## CKEditor 5
- Compared to previous versions of CKEditor seems to be a modern library
- Licensed under a dual GPL + commercial license. The author has [expressed intent about the goal of the open source license](https://github.com/ckeditor/ckeditor5/issues/991#issuecomment-389812759).
- My interpretation is that to include CKEditor this project would need to be licensed as GPL which is not a goal of this project
- As such removed the source / binaries for CKEditor itself, the CKEditor example remains for those who wish to utilize the CKEditor under its license terms
