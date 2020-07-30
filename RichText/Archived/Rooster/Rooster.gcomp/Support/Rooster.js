(function () {
    'use strict';

    const validateRooster = function (rooster) {
        if (!(rooster && rooster.roosterContainer && rooster.roosterEditor)) {
            throw new Error('Expected valid Rooster reference.');
        }
    };

    const setDisabledHelper = function (rooster, disabled) {
        const {roosterContainer} = rooster;
        const enabled = !disabled;

        // Rooster does not have built-in disabled behavior
        roosterContainer.contentEditable = enabled;
    };

    const create = function (element, disabled) {
        const roosterContainer = document.createElement('div');
        roosterContainer.classList.add('webvi-rooster-container');

        element.appendChild(roosterContainer);

        const roosterEditor = window.roosterjs.createEditor(roosterContainer);
        const rooster = {
            roosterContainer,
            roosterEditor
        };
        setDisabledHelper(rooster, disabled);
        return rooster;
    };

    const destroy = function (rooster) {
        validateRooster(rooster);
        const {roosterContainer, roosterEditor} = rooster;
        roosterEditor.dispose();
        roosterContainer.parentNode.removeChild(roosterContainer);
    };

    const getContent = function (rooster) {
        validateRooster(rooster);
        const {roosterEditor} = rooster;
        const content = roosterEditor.getContent();
        return content;
    };

    const setContent = function (rooster, content) {
        validateRooster(rooster);
        const {roosterEditor} = rooster;
        roosterEditor.setContent(content);
    };

    const setDisabled = function (rooster, disabled) {
        validateRooster(rooster);
        setDisabledHelper(rooster, disabled);
    };

    window.WebVIRooster = {
        create,
        destroy,
        getContent,
        setContent,
        setDisabled
    };
}());
