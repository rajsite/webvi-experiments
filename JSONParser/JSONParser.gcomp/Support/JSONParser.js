(function () {
    'use strict';
    // TokenTypes: <Array, ArrayEnd, ArrayDouble, ArrayString, ArrayBoolean, Object, ObjectKey, ObjectEnd, Double, String, True, False, Null>
    // Token {Type, Data, Offsets}
    // Token {
    //     T:  For all types -> One of <A, AE, AD, AS, AB, O, OK, OE, D, S, T, F, N>
    //     D:
    //         For ArrayDouble, ArrayString, ArrayBoolean -> JSON string of the corresponding types as a 1D array
    //         For ObjectKey -> string of key
    //         For Double -> string of number and cannot be IEEE754 special tokens (NaN, Infinitiy, -Infinity)
    //         For String -> string
    //         For other types -> field ommitted
    //     O:
    //         For Array -> offsets to each value and an additional offset to ArrayEnd
    //         For Object -> offsets to each ObjectKey (and the value starts one after the offset) and an additional offset to ObjectEnd
    //         For other types -> field omitted
    //         Note the offsets are relative to the current token not the top-level token array
    // }
    // The Type field will always be emitted, the Data and Offsets will only be emitted as needed.
    // Note the Types ArrayDouble, ArrayString, and ArrayBoolean do not have Offsets or corresponding ArrayEnd tokens.
    //
    // Example:
    // {"hello": "world"} -> [{"T":"O","O":[1,3]}, {"T":"OK","D":"hello"}, {"T":"S","D":"world"}, {"T":"OE"}]
    //
    // Notable edge cases:
    // true -> [{"T":"T"}]
    // false -> [{"T":"F"}]
    // null -> [{"T":"N"}]
    // [] -> [{"T":"A","O":[1]}, {"T":"AE"}]
    // {} -> [{"T":"O","O":[1]}, {"T":"OE"}]
    // [1] -> [{"T":"AD","D":"[1]"}]
    // [[1]] -> [{"T":"A","O":[1,2]}, {"T":"AD","D":"[1]"}, {"T":"AE"}]
    // [[[1]]] -> [{"T":"A","O":[1,4]}, {"T":"A","O":[1,2]}, {"T":"AD","D":"[1]"}, {"T":"AE"}, {"T":"AE"}]
    // [[1,2,3],[4,5,6],[7,8,9]] -> [{"T":"A","O":[1,2,3,4]}, {"T":"AD","D":"[1,2,3]"}, {"T":"AD","D":"[4,5,6]"}, {"T":"AD","D":"[7,8,9]"}, {"T":"AE"}]
    // [1,null] -> [{"T":"A","O":[1,2,3]}, {"T":"D","D":"1"}, {"T":"N"}, {"T":"AE"}]

    // TokenTypes
    const ARRAY = 'A';
    const ARRAYEND = 'AE';
    const ARRAYDOUBLE = 'AD';
    const ARRAYSTRING = 'AS';
    const ARRAYBOOLEAN = 'AB';
    const OBJECT = 'O';
    const OBJECTKEY = 'OK';
    const OBJECTEND = 'OE';
    const DOUBLE = 'D';
    const STRING = 'S';
    const TRUE = 'T';
    const FALSE = 'F';
    const NULL = 'N';

    // Token Fields
    const TYPE = 'T';
    const DATA = 'D';
    const OFFSETS = 'O';

    // Parsing functions
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

    const visitArrayOfPrimitives = function (value) {
        const tokens = [];
        if (value.length < 1) {
            return tokens;
        }
        const expectedType = typeof value[0];
        if (expectedType !== 'number' && expectedType !== 'string' && expectedType !== 'boolean') {
            return tokens;
        }
        for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== expectedType) {
                return tokens;
            }
        }
        let tokenType;
        if (expectedType === 'number') {
            tokenType = ARRAYDOUBLE;
        } else if (expectedType === 'string') {
            tokenType = ARRAYSTRING;
        } else {
            tokenType = ARRAYBOOLEAN;
        }
        tokens.push({
            [TYPE]: tokenType,
            [DATA]: JSON.stringify(value)
        });
        return tokens;
    };

    const visitArray = function (value) {
        const arrayOfPrimitivesTokens = visitArrayOfPrimitives(value);
        if (arrayOfPrimitivesTokens.length > 0) {
            return arrayOfPrimitivesTokens;
        }

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

    // Global property for JSLI
    window.WebVIJSONParser = {jsonTokenize};
}());
