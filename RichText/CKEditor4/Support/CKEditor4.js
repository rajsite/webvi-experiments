(function () {
    'use strict';

    const validateCKEditor = function (editor) {
        if (editor instanceof window.CKEDITOR.editor === false) {
            throw new Error('Expected valid CKEditor reference.');
        }
    };

    const ckeditorLoaded = function () {
        return new Promise(function (resolve) {
            if (!window.CKEDITOR) {
                throw new Error('CKEditor global not found.');
            }
            if (window.CKEDITOR.status === 'loaded') {
                resolve();
            } else {
                window.CKEDITOR.on('loaded', () => resolve());
            }
        });
    };

    const ckeditorInstanceReady = function (editor) {
        return new Promise(function (resolve) {
            if (editor.status === 'ready') {
                resolve();
            } else {
                editor.on('instanceReady', () => resolve());
            }
        });
    };

    const create = async function (element, disabled) {
        await ckeditorLoaded();
        const config = {
            language: 'en',
            readOnly: disabled,
            resize_enabled: false,
            disableNativeSpellChecker: false,
            removePlugins: 'wsc,scayt,sourcearea,about,elementspath',
            extraPlugins: 'sourcedialog'
        };
        const editor = window.CKEDITOR.appendTo(element, config);
        await ckeditorInstanceReady(editor);
        editor.container.addClass('webvi-ckeditor-container');
        return editor;
    };

    const destroy = function (editor) {
        validateCKEditor(editor);
        editor.destroy();
    };

    const getContent = function (editor) {
        validateCKEditor(editor);
        return editor.getData();
    };

    const ckeditorSetData = function (editor, content) {
        return new Promise(function (resolve) {
            editor.setData(content, {callback: () => resolve()});
        });
    };

    const setContent = async function (editor, content) {
        validateCKEditor(editor);
        await ckeditorSetData(editor, content);
    };

    const setDisabled = function (editor, disabled) {
        validateCKEditor(editor);
        editor.setReadOnly(disabled);
    };

    window.WebVICKEditor4 = {
        create,
        destroy,
        getContent,
        setContent,
        setDisabled
    };
}());
