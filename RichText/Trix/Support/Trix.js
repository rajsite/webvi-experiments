(function () {
    'use strict';

    const validateTrix = function (trix) {
        if (trix && trix.trixContainer && trix.trixEditor === false) {
            throw new Error('Expected valid trix reference.');
        }
    };

    const setDisableHelper = function (trix, disabled) {
        const {trixContainer, trixEditor} = trix;
        const enabled = !disabled;

        // Trix does not have built-in disabled behavior, used pattern from https://github.com/basecamp/trix/issues/331
        trixEditor.contentEditable = enabled;
        trixContainer.classList.toggle('webvi-trix-disable', disabled);
    };

    const create = function (element, disabled) {
        const trixContainer = document.createElement('div');
        trixContainer.classList.add('webvi-trix-container');

        const trixEditor = document.createElement('trix-editor');
        trixEditor.addEventListener('trix-file-accept', evt => evt.preventDefault());

        trixContainer.appendChild(trixEditor);
        element.appendChild(trixContainer);

        const trix = {
            trixContainer,
            trixEditor
        };

        setDisableHelper(trix, disabled);
        return trix;
    };

    const destroy = function (trix) {
        validateTrix(trix);
        const {trixContainer} = trix;
        trixContainer.parentNode.removeChild(trixContainer);
    };

    const getContent = function (trix) {
        validateTrix(trix);
        const {trixEditor} = trix;
        const content = trixEditor.value;
        return content;
    };

    const setContent = function (trix, content) {
        validateTrix(trix);
        const {trixEditor} = trix;
        trixEditor.value = content;
    };

    const setDisabled = function (trix, disabled) {
        validateTrix(trix);
        setDisableHelper(trix, disabled);
    };

    window.WebVITrix = {
        create,
        destroy,
        getContent,
        setContent,
        setDisabled
    };
}());
