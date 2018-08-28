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
];
function isKeyword(token) {
    return exports.keywords.includes(token);
}
exports.isKeyword = isKeyword;
function isPrimitive(token) {
    return exports.primitives.includes(token);
}
exports.isPrimitive = isPrimitive;
function getPrimitives(prim) {
    const match = new Map();
    match["and"] = (a, b) => {
        if (a.is(utils_1.ValueType.BOOLEAN) && b.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, a.value && b.value);
        }
        throw `Type dismatch when calling primitive function and`;
    };
    match["or"] = (a, b) => {
        if (a.is(utils_1.ValueType.BOOLEAN) && b.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, a.value || b.value);
        }
        throw `Type dismatch when calling primitive function or`;
    };
    match["nand"] = (a, b) => {
        if (a.is(utils_1.ValueType.BOOLEAN) && b.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, !(a.value && b.value));
        }
        throw `Type dismatch when calling primitive function nand`;
    };
    match["not"] = (a) => {
        if (a.is(utils_1.ValueType.BOOLEAN)) {
            return new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, !a.value);
        }
        throw `Type dismatch when calling primitive function not`;
    };
    // TODO
}
exports.getPrimitives = getPrimitives;
//# sourceMappingURL=constants.js.map