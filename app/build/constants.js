"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
exports.keywords = [
    "define",
    "let",
    "lambda",
    "if",
    "cond",
    "set!",
    "letrec",
    "else",
    "begin",
    "quote"
];
exports.primitives = [
    "and",
    "or",
    "nand",
    "not",
    "display",
    "newline",
    "+",
    "-",
    "*",
    "/",
    "read",
    "=",
    "<",
    ">",
    "call/cc",
];
function isKeyword(token) {
    return exports.keywords.includes(token);
}
exports.isKeyword = isKeyword;
function isPrimitive(token) {
    return exports.primitives.includes(token);
}
exports.isPrimitive = isPrimitive;
function getPrimitives(prim, context) {
    const match = new Map();
    match.set("and", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <and> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(utils_1.ValueType.BOOLEAN) && b.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, a.value && b.value);
        }
        throw `Type dismatch when calling primitive function <and>`;
    });
    match.set("or", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <or> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(utils_1.ValueType.BOOLEAN) && b.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, a.value || b.value);
        }
        throw `Type dismatch when calling primitive function <or>`;
    });
    match.set("nand", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <nand> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(utils_1.ValueType.BOOLEAN) && b.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, !a.value && b.value);
        }
        throw `Type dismatch when calling primitive function <nand>`;
    });
    match.set("not", (parameters) => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <not> must be 1`;
        }
        const a = parameters[0];
        if (a.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, !a.value);
        }
        throw `Type dismatch when calling primitive function <not>`;
    });
    match.set("display", (parameters) => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <display> must be 1`;
        }
        context.output(parameters[0].print());
        return context.VOID_VALUE;
    });
    match.set("+", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <add> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(utils_1.ValueType.INTEGER) && b.is(utils_1.ValueType.INTEGER)) {
            return new utils_1.SimpValue(utils_1.ValueType.INTEGER, a.value + b.value);
        }
        throw `Type dismatch when calling primitive function <add>`;
    });
    if (match.has(prim)) {
        return match.get(prim);
    }
    throw `${prim} is not supported in interact environment right now`;
}
exports.getPrimitives = getPrimitives;
//# sourceMappingURL=constants.js.map