(function () {
    'use strict';

    const createExorbitant = async function () {
        return await window.exorbitantHelpers.createExorbitant();
    };

    const createSymbolTable = function (exorbitant) {
        return exorbitant.createSymbolTable();
    };

    const createExpression = function (exorbitant) {
        return exorbitant.createExpression();
    };

    const createParser = function (exorbitant) {
        return exorbitant.createParser();
    };

    const expressionRegisterSymbolTable = function (expression, symbolTable) {
        return expression.registerSymbolTable(symbolTable);
    };

    const parserCompile = function (parser, expressionStr, expression) {
        return parser.compile(expressionStr, expression);
    };

    const expressionValue = function (expression) {
        return expression.value();
    };

    window.WebVIExorbitant = {
        createExorbitant,
        createSymbolTable,
        createExpression,
        createParser,
        expressionRegisterSymbolTable,
        parserCompile,
        expressionValue
    };
}());
