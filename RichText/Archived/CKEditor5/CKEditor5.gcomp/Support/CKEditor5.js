(function () {
    'use strict';

    const create = async function (element) {
        const ckeditorContainer = document.createElement('div');
        ckeditorContainer.classList.add('webvi-ckeditor-container');
        const textarea = document.createElement('textarea');
        ckeditorContainer.appendChild(textarea);
        element.appendChild(ckeditorContainer);

        await window.ClassicEditor.create(textarea);
    };

    window.WebVICKEditor5 = {create};
}());
