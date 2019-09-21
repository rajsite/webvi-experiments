(function () {
    'use strict';
    // TokenTypes: <Array, ArrayEnd, Object, ObjectKey, ObjectEnd, Double, String, True, False, Null>
    // Token {Type, Data, Offsets}
    // Token {
    //     T:  One of <A, AE, O, OK, OE, D, S, T, F, N>, field always included
    //     D:
    //         For ObjectKey, simple string of key
    //         For Double, simple string and because source is parsed with JSON.parse(), cannot be IEEE754 special tokens (NaN, Infinitiy, -Infinity)
    //         For String, simple string
    //         For other types, field ommitted
    //     O:
    //         For Array, offsets to each value and an additional offset to ArrayEnd
    //         For Object, offsets to each ObjectKey (and the value starts one after the offset) and an additional offset to ObjectEnd
    //         For other types, field omitted
    // }
    // The Type field will always be emitted, the Data and Offsets will only be emitted as needed
    // Examples:
    // true -> [{"T":"T"}]
    // {"hello": "world"} -> [{"T":"O","O":[1,3]},{"T":"OK","D":"hello"},{"T":"S","D":"world"},{"T":"OE"}]

    const ARRAY = 'A';
    const ARRAYEND = 'AE';
    const OBJECT = 'O';
    const OBJECTKEY = 'OK';
    const OBJECTEND = 'OE';
    const DOUBLE = 'D';
    const STRING = 'S';
    const TRUE = 'T';
    const FALSE = 'F';
    const NULL = 'N';

    const TYPE = 'T';
    const DATA = 'D';
    const OFFSETS = 'O';

    let visitValue;

    const visitDouble = function (value) {
        return [{
            [TYPE]: DOUBLE,
            [DATA]: String(value)
        }];
    };

    const visitString = function (value) {
        return [{
            [TYPE]: STRING,
            [DATA]: value
        }];
    };

    const visitBoolean = function (value) {
        return [{[TYPE]: value ? TRUE : FALSE}];
    };

    const visitNull = function () {
        return [{[TYPE]: NULL}];
    };

    const visitArray = function (value) {
        const tokens = [];
        const offsets = [];

        tokens.push({
            [TYPE]: ARRAY,
            [OFFSETS]: offsets
        });

        let currentOffset = 1;
        for (let i = 0; i < value.length; i++) {
            const valueTokens = visitValue(value[i]);
            offsets.push(currentOffset);
            tokens.push(...valueTokens);
            currentOffset += valueTokens.length;
        }

        offsets.push(currentOffset);
        tokens.push({[TYPE]: ARRAYEND});
        return tokens;
    };

    const visitObject = function (value) {
        const tokens = [];
        const offsets = [];

        tokens.push({
            [TYPE]: OBJECT,
            [OFFSETS]: offsets
        });

        let currentOffset = 1;
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                const valueTokens = visitValue(value[key]);
                offsets.push(currentOffset);
                tokens.push({
                    [TYPE]: OBJECTKEY,
                    [DATA]: key
                });
                currentOffset += 1;
                tokens.push(...valueTokens);
                currentOffset += valueTokens.length;
            }
        }

        offsets.push(currentOffset);
        tokens.push({[TYPE]: OBJECTEND});
        return tokens;
    };

    visitValue = function (value) {
        if (value === null) {
            return visitNull();
        } else if (typeof value === 'number') {
            return visitDouble(value);
        } else if (typeof value === 'string') {
            return visitString(value);
        } else if (typeof value === 'boolean') {
            return visitBoolean(value);
        } else if (Array.isArray(value)) {
            return visitArray(value);
        } else if (typeof value === 'object' && value !== null) {
            return visitObject(value);
        }
        throw new Error(`Unknown type for value ${value}`);
    };

    const jsonTokenize = function (jsonString) {
        const value = JSON.parse(jsonString);
        const tokens = visitValue(value);
        const tokensJSON = JSON.stringify(tokens);
        return tokensJSON;
    };

    window.WebVIJSONParser = {jsonTokenize};
}());
