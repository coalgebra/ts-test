"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("./value");
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
    "quote",
    "let*",
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
    "car",
    "cdr",
    "cons",
    "null?",
    "eq?"
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
        if (a.is(value_1.ValueType.BOOLEAN) && b.is(value_1.ValueType.BOOLEAN)) {
            return new value_1.SimpValue(value_1.ValueType.BOOLEAN, a.value && b.value);
        }
        throw `Type dismatch when calling primitive function <and>`;
    });
    match.set("or", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <or> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(value_1.ValueType.BOOLEAN) && b.is(value_1.ValueType.BOOLEAN)) {
            return new value_1.SimpValue(value_1.ValueType.BOOLEAN, a.value || b.value);
        }
        throw `Type dismatch when calling primitive function <or>`;
    });
    match.set("nand", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <nand> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(value_1.ValueType.BOOLEAN) && b.is(value_1.ValueType.BOOLEAN)) {
            return new value_1.SimpValue(value_1.ValueType.BOOLEAN, !(a.value && b.value));
        }
        throw `Type dismatch when calling primitive function <nand>`;
    });
    match.set("not", (parameters) => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <not> must be 1`;
        }
        const a = parameters[0];
        if (a.is(value_1.ValueType.BOOLEAN)) {
            return new value_1.SimpValue(value_1.ValueType.BOOLEAN, !a.value);
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
    match.set("newline", (parameters) => {
        if (parameters.length !== 0) {
            throw `Parameter number of primitive <newline> must be 0`;
        }
        context.output("\n");
        return context.VOID_VALUE;
    });
    match.set("+", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <add> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(value_1.ValueType.INTEGER) && b.is(value_1.ValueType.INTEGER)) {
            return new value_1.SimpValue(value_1.ValueType.INTEGER, a.value + b.value);
        }
        throw `Type dismatch when calling primitive function <add>`;
    });
    match.set("-", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <sub> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(value_1.ValueType.INTEGER) && b.is(value_1.ValueType.INTEGER)) {
            return new value_1.SimpValue(value_1.ValueType.INTEGER, a.value - b.value);
        }
        throw `Type dismatch when calling primitive function <sub>`;
    });
    match.set("*", (parameters) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <mul> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(value_1.ValueType.INTEGER) && b.is(value_1.ValueType.INTEGER)) {
            return new value_1.SimpValue(value_1.ValueType.INTEGER, a.value * b.value);
        }
        throw `Type dismatch when calling primitive function <mul>`;
    });
    match.set("cons", parameters => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <cons> must be 2`;
        }
        return new value_1.PairValue(parameters[0], parameters[1]);
    });
    match.set("car", parameters => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <car> must be 1`;
        }
        const val = parameters[0];
        if (val instanceof value_1.PairValue) {
            return val.car;
        }
        else {
            throw `Parameter of primitive <car> must be a pair`;
        }
    });
    match.set("cdr", parameters => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <cdr> must be 1`;
        }
        const val = parameters[0];
        if (val instanceof value_1.PairValue) {
            return val.cdr;
        }
        else {
            throw `Parameter of primitive <cdr> must be a pair`;
        }
    });
    match.set("null?", parameters => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <null?> must be 1`;
        }
        return new value_1.SimpValue(value_1.ValueType.BOOLEAN, parameters[0].type === value_1.ValueType.NIL);
    });
    match.set("eq?", parameters => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <eq?> must be 2`;
        }
        if (parameters[0].type !== parameters[1].type)
            return new value_1.SimpValue(value_1.ValueType.BOOLEAN, false);
        if (parameters[0] instanceof value_1.SimpValue) {
            return new value_1.SimpValue(value_1.ValueType.BOOLEAN, parameters[0].value === parameters[1].value);
        }
        return new value_1.SimpValue(value_1.ValueType.BOOLEAN, parameters[0] === parameters[1]);
    });
    if (match.has(prim)) {
        return match.get(prim);
    }
    throw `${prim} is not supported in interact environment right now`;
}
exports.getPrimitives = getPrimitives;
//# sourceMappingURL=constants.js.map