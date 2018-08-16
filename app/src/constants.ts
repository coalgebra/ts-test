export const keywords = [
    "define",
    "let",
    "lambda",
    "if",
    "cond",
    "set!",
    "letrec",
    "else",
    "begin",
];

export const primitives = [
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

export function isKeyword(token: string): boolean {
    return keywords.includes(token);
}

export function isPrimitive(token: string): boolean {
    return primitives.includes(token);
}
