// Copyright (c) 2020 Milan Raj
// SPDX-License-Identifier: MIT

import exorbitant from '../dist/exorbitant.js';

// Make sure to use Module.stackSave() before calling
const writeStringToStack = function (Module, str) {
    var strMaxStackLength = (str.length << 2) + 1;
    var strStackPointer = Module.stackAlloc(strMaxStackLength);
    Module.stringToUTF8(str, strStackPointer, strMaxStackLength);
    return strStackPointer;
};

class Variable {
    constructor (Module, variableRef) {
        this._Module = Module;
        this._variableRef = variableRef;
    }

    set value (number) {
        this._Module.HEAPF64[this._variableRef / 8] = number;
    }

    get value () {
        return this._Module.HEAPF64[this._variableRef / 8];
    }
}

class Vector {
    constructor (Module, vectorRef, size) {
        this._Module = Module;
        this._vectorRef = vectorRef;
        this._size = size;
    }

    // Only valid until before another exorbitant function used. DO NO SAVE REFERENCE.
    // Memory growth due to function execution will invalidate buffer.
    createBufferView () {
        return new Float64Array(this._Module.HEAP8.buffer, this._vectorRef, this._size);
    }

    assign (arrayLike) {
        for (let i = this._vectorRef / 8; i < this._size; i++) {
            this._Module.HEAPF64[i] = arrayLike[i];
        }
    }
}

class SymbolTable {
    constructor (Module, symbolTableRef) {
        this._Module = Module;
        this._symbolTableRef = symbolTableRef;
    }

    createVariable (name) {
        const variableRef = this._Module._malloc(8);
        if (variableRef === 0) {
            throw new Error(`Not enough memory to allocate variable ${name}.`);
        }
        const stack = this._Module.stackSave();
        const nameRef = writeStringToStack(this._Module, name);
        const ret = this._Module._SymbolTable_AddVariable(this._symbolTableRef, nameRef, variableRef);
        this._Module.stackRestore(stack);
        this._Module.exorbitantFlush();
        return new Variable(this._Module, variableRef);
    }

    createVector (name, size) {
        const vectorRef = this._Module._malloc(size * 8);
        if (vectorRef === 0) {
            throw new Error(`Not enough memory to allocate vector ${name} with size ${size}.`);
        }
        const stack = this._Module.stackSave();
        const nameRef = writeStringToStack(this._Module, name);
        const ret = this._Module._SymbolTable_AddVector(this._symbolTableRef, nameRef, vectorRef, size);
        this._Module.stackRestore(stack);
        this._Module.exorbitantFlush();
        return new Vector(this._Module, vectorRef, size);
    }
}

class Expression {
    constructor (Module, expressionRef) {
        this._Module = Module;
        this._expressionRef = expressionRef;
    }

    registerSymbolTable (symbolTable) {
        this._Module._Expression_RegisterSymbolTable(this._expressionRef, symbolTable._symbolTableRef);
        this._Module.exorbitantFlush();
    }

    value () {
        const ret = this._Module._Expression_Value(this._expressionRef);
        this._Module.exorbitantFlush();
        return ret;
    }
}

class Parser {
    constructor (Module, parserRef) {
        this._Module = Module;
        this._parserRef = parserRef;
    }

    compile (str, expression) {
        const stack = this._Module.stackSave();
        const strRef = writeStringToStack(this._Module, str);
        const ret = this._Module._Parser_Compile(this._parserRef, strRef, expression._expressionRef);
        this._Module.stackRestore(stack);
        this._Module.exorbitantFlush();
        return ret;
    }
}

class Exorbitant {
    constructor (Module) {
        this._Module = Module;
    }

    createSymbolTable () {
        const symbolTableRef = this._Module._SymbolTable_Create();
        this._Module.exorbitantFlush();
        return new SymbolTable(this._Module, symbolTableRef);
    }

    createExpression () {
        const expressionRef = this._Module._Expression_Create();
        this._Module.exorbitantFlush();
        return new Expression(this._Module, expressionRef);
    }

    createParser () {
        const parserRef = this._Module._Parser_Create();
        this._Module.exorbitantFlush();
        return new Parser(this._Module, parserRef);
    }
}

const createExorbitant = async function () {
    const ModuleIn = {
        arguments: ['--exit']
    };
    const ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
    if (ENVIRONMENT_IS_NODE) {
        ModuleIn.locateFile = function (path, prefix) {
            if (path.endsWith('.wasm')) {
                return __dirname + '/exorbitant.wasm';
            }
            return prefix + path;
        };
        ModuleIn.quit = function (status, toThrow) {
            throw toThrow;
        };
    }
    const Module = await exorbitant(ModuleIn);
    return new Exorbitant(Module);
};

export {createExorbitant};
