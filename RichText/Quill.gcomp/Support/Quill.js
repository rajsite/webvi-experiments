/* global Quill:false */
(function () {
    'use strict';

    class ReferenceManager {
        constructor () {
            this._nextReference = 1;
            this.references = new Map();
        }

        createReference (obj) {
            const reference = this._nextReference;
            this._nextReference += 1;
            this.references.set(reference, obj);
            return reference;
        }

        getObject (reference) {
            return this.references.get(reference);
        }

        closeReference (reference) {
            this.references.delete(reference);
        }
    }
    const referenceManager = new ReferenceManager();

    const quillTemplate = `
        <div class="webvi-quill-container">
            <div class="webvi-quill-toolbar">
                <span class="ql-formats">
                    <select class="ql-font"></select>
                    <select class="ql-size"></select>
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                    <button class="ql-strike"></button>
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                    <button class="ql-script" value="sub"></button>
                    <button class="ql-script" value="super"></button>
                    <button class="ql-header" value="1"></button>
                    <button class="ql-header" value="2"></button>
                    <button class="ql-blockquote"></button>
                    <button class="ql-code-block"></button>
                    <button class="ql-list" value="ordered"></button>
                    <button class="ql-list" value="bullet"></button>
                    <button class="ql-indent" value="-1"></button>
                    <button class="ql-indent" value="+1"></button>
                    <button class="ql-direction" value="rtl"></button>
                    <select class="ql-align"></select>
                    <button class="ql-link"></button>
                    <button class="ql-image"></button>
                    <button class="ql-video"></button>
                    <button class="ql-formula"></button>
                    <button class="ql-clean"></button>
                </span>
            </div>
            <div class="webvi-quill-editor"></div>
        </div>
    `;

    const setDisabledHelper = function (quill, disabled) {
        const enable = !disabled;
        quill.enable(enable);
        quill.options.bounds.classList.toggle('webvi-quill-disable', disabled);
    };

    const removeHiddenToolbarFormats = function (webviQuillToolbar, toolbarFormats) {
        const toolbarElements = [...webviQuillToolbar.querySelectorAll('.ql-formats > *')];
        toolbarElements.forEach(element => {
            const format = element.classList[0].substring('ql-'.length);
            if (!toolbarFormats.includes(format)) {
                element.parentNode.removeChild(element);
            }
        });
    };

    const createQuill = function (selector, formatsJSON, hiddenToolbarFormatsJSON, disabled) {
        const elements = document.querySelectorAll(selector);
        if (elements.length !== 1) {
            throw new Error(`Expected to find one element with selector ${selector}, but found ${elements.length}`);
        }
        const formats = JSON.parse(formatsJSON);
        const hiddenToolbarFormats = JSON.parse(hiddenToolbarFormatsJSON);
        const toolbarFormats = formats.filter(format => !hiddenToolbarFormats.includes(format));

        const template = document.createElement('template');
        template.innerHTML = quillTemplate;
        const quillTemplateInstance = template.content;
        const webviQuillContainer = quillTemplateInstance.querySelector('.webvi-quill-container');
        const webviQuillToolbar = quillTemplateInstance.querySelector('.webvi-quill-toolbar');
        const webviQuillEditor = quillTemplateInstance.querySelector('.webvi-quill-editor');
        removeHiddenToolbarFormats(webviQuillToolbar, toolbarFormats);

        const element = elements[0];
        element.innerHTML = '';
        element.appendChild(webviQuillContainer);

        const quill = new Quill(webviQuillEditor, {
            modules: {toolbar: webviQuillToolbar},
            theme: 'snow',
            bounds: webviQuillContainer,
            formats
        });
        setDisabledHelper(quill, disabled);
        const quillReference = referenceManager.createReference(quill);
        window.quill = quill;
        return quillReference;

        // var quill = new Quill('#editor-container', {
        //     modules: {
        //       syntax: true,
        //       toolbar: '#toolbar-container'
        //     },
        //     placeholder: 'Compose an epic...',
        //     theme: 'snow'
        //   });
    };

    const destroyQuill = function (quillReference) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            return;
        }
        referenceManager.closeReference(quillReference);
        quill.container.parentNode.removeChild(quill.container);
    };

    const getContents = function (quillReference) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            throw new Error('Expected instance of Quill object');
        }
        const deltas = quill.getContents();
        const deltasJSON = JSON.stringify(deltas);
        return deltasJSON;
    };

    const setContents = function (quillReference, deltasJSON) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            throw new Error('Expected instance of Quill object');
        }
        const deltas = JSON.parse(deltasJSON);
        quill.setContents(deltas);
    };

    const setDisabled = function (quillReference, disabled) {
        const quill = referenceManager.getObject(quillReference);
        if (quill instanceof Quill === false) {
            throw new Error('Expected instance of Quill object');
        }
        setDisabledHelper(quill, disabled);
    };

    window.WebVIQuill = {
        createQuill,
        destroyQuill,
        getContents,
        setContents,
        setDisabled
    };
}());
