(function () {
    'use strict';

    let visitValue;

    const visitArray = function (jsonTree, path, values) {
        if (values.length === 0) {
            const nextPath = `${path}[]`;
            const value = '';
            visitValue(jsonTree, nextPath, value);
        } else {
            values.forEach(function (value, index) {
                const nextPath = `${path}[${index}]`;
                visitValue(jsonTree, nextPath, value);
            });
        }
    };

    const visitObject = function (jsonTree, path, values) {
        if (Object.keys(values).length === 0) {
            const nextPath = `${path}{}`;
            const value = '';
            visitValue(jsonTree, nextPath, value);
        } else {
            Object.keys(values).forEach(function (key) {
                const nextPath = `${path}\\${key}`;
                const value = values[key];
                visitValue(jsonTree, nextPath, value);
            });
        }
    };

    visitValue = function (jsonTree, path, value) {
        if (value === null || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
            jsonTree.push({
                path,
                value: String(value)
            });
        } else if (Array.isArray(value)) {
            visitArray(jsonTree, path, value);
        } else if (typeof value === 'object' && value !== null) {
            visitObject(jsonTree, path, value);
        }
    };

    const parseJSON = function (json) {
        try {
            return JSON.parse(json);
        } catch (ex) {
            return undefined;
        }
    };

    const formatJSONForTree = function (json) {
        const jsonTree = [];
        const value = parseJSON(json);
        if (value !== undefined) {
            visitValue(jsonTree, '', value);
        }
        const treeJSON = JSON.stringify(jsonTree);
        return treeJSON;
    };

    window.WebVITreeFormatter = {formatJSONForTree};
}());
