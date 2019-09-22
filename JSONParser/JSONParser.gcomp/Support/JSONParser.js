(function () {
    'use strict';
    // TokenTypesEnum: <Array, ArrayEnd, ArrayDouble, ArrayString, ArrayBoolean, Object, ObjectKey, ObjectEnd, Double, String, True, False, Null>
    // Token {Type, Data, Offsets}
    // Token {
    //     T:  For all types -> One of TokenTypesEnum as number
    //     D:
    //         For ArrayDouble, ArrayString, ArrayBoolean -> JSON string of the corresponding types as a 1D array
    //         For ObjectKey -> string of key
    //         For Double -> string of number, cannot be IEEE754 special tokens (NaN, Infinitiy, -Infinity) because using built-in JSON.parse()
    //         For String -> string
    //         For other types -> empty string
    //     O:
    //         For Array -> offsets to each value and an additional offset to ArrayEnd
    //         For Object -> offsets to each ObjectKey (and the value starts one after the offset) and an additional offset to ObjectEnd
    //         For other types -> empty array
    //         Note the offsets are relative to the current token not the top-level token array
    // }
    // Note the Types ArrayDouble, ArrayString, and ArrayBoolean do not have corresponding ArrayEnd tokens.
    //
    // Conceptual examples:
    // **NOTE**: Examples omit empty fields and are using abbrevated token names instead of enum numbers for readability
    //
    // Simple object:
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
    const ARRAY = 0;
    const ARRAYEND = 1;
    const ARRAYDOUBLE = 2;
    const ARRAYSTRING = 3;
    const ARRAYBOOLEAN = 4;
    const OBJECT = 5;
    const OBJECTKEY = 6;
    const OBJECTEND = 7;
    const DOUBLE = 8;
    const STRING = 9;
    const TRUE = 10;
    const FALSE = 11;
    const NULL = 12;

    // Token Fields
    const TYPE = 'T';
    const DATA = 'D';
    const OFFSETS = 'O';

    // Parsing functions
    let visitValue;

    const visitDouble = function (value) {
        return [{
            [TYPE]: DOUBLE,
            [DATA]: String(value),
            [OFFSETS]: []
        }];
    };

    const visitString = function (value) {
        return [{
            [TYPE]: STRING,
            [DATA]: value,
            [OFFSETS]: []
        }];
    };

    const visitBoolean = function (value) {
        return [{
            [TYPE]: value ? TRUE : FALSE,
            [DATA]: '',
            [OFFSETS]: []
        }];
    };

    const visitNull = function () {
        return [{
            [TYPE]: NULL,
            [DATA]: '',
            [OFFSETS]: []
        }];
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
            [DATA]: JSON.stringify(value),
            [OFFSETS]: []
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
            [DATA]: '',
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
        tokens.push({
            [TYPE]: ARRAYEND,
            [DATA]: '',
            [OFFSETS]: []
        });
        return tokens;
    };

    const visitObject = function (value) {
        const tokens = [];
        const offsets = [];

        tokens.push({
            [TYPE]: OBJECT,
            [DATA]: '',
            [OFFSETS]: offsets
        });

        let currentOffset = 1;
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                const valueTokens = visitValue(value[key]);
                offsets.push(currentOffset);
                tokens.push({
                    [TYPE]: OBJECTKEY,
                    [DATA]: key,
                    [OFFSETS]: []
                });
                currentOffset += 1;
                tokens.push(...valueTokens);
                currentOffset += valueTokens.length;
            }
        }

        offsets.push(currentOffset);
        tokens.push({
            [TYPE]: OBJECTEND,
            [DATA]: '',
            [OFFSETS]: []
        });
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

    const jsonStringify = function (tokensJSON) {
        const tokens = JSON.parse(tokensJSON);
        let result = tokens;
        const currentValueJSON = JSON.stringify(result);
        return currentValueJSON;
    };

    // Global property for JSLI
    window.WebVIJSONParser = {
        jsonTokenize,
        jsonStringify
    };
}());
