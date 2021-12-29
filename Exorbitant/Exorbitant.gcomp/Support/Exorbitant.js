(function () {
    'use strict';

    const createExorbitant = async function (configurationJSON) {
        const configuration = JSON.parse(configurationJSON);
        const exorbitant = await window.exorbitant.createExorbitantRuntime().createExorbitant(configuration);
        return exorbitant;
    };

    const exorbitantValue = async function (exorbitant) {
        const result = await exorbitant.value();
        return result;
    };

    const exorbitantGetVector = async function (exorbitant, name) {
        return exorbitant.getVector(name);
    };

    window.WebVIExorbitant = {
        createExorbitant,
        exorbitantValue,
        exorbitantGetVector
    };
}());
