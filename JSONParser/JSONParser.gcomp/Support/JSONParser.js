(function () {
    'use strict';
    // TokenTypes: <Array, ArrayEnd, Object, ObjectKey, ObjectEnd, Double, String, True, False, Null>
    // Token {Type, Value, Indices}
    // Token {
    //     T: <A, AE, O, OK, OE, D, S, T, F, N>
    //     V: simple string for ObjectKey, Number (because source is JSON, cannot be IEEE754 special token), and String; empty string for others
    //     I:
    //         For Array, indices of each value and an additional index to ArrayEnd
    //         For Object, indices to each ObjectKey and an additional index to ObjectEnd
    //         For others, empty array
    // }
    // The Type field will always be emitted, the Value and Indices will only be emitted as needed
    // Examples:
    // true -> [{"T":"T"}]
    // {"hello": "world"} -> [{"T":"O","I":[1,3]},{"T":"OK","V":"hello"},{"T":"S","V":"world"},{"T":"OE"}]

    const jsonTokenize = function (jsonString) {
        const value = JSON.parse(jsonString);
        const tokens = [];
        let currentNode = 0;

        const visitArray = function (value) {
            const children = [];
        };

        const visitValue = function (value) {
        };

        const tokensJSON = JSON.stringify(tokens);
        return tokensJSON;
    };

    window.WebVIJSONParser = {jsonTokenize};
}());
