"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=constants.js.map