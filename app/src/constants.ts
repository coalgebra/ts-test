import {SimpValue, Value, ValueType} from "./utils";

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
    "quote"
];

export const primitives = [
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

export function isKeyword(token: string): boolean {
    return keywords.includes(token);
}

export function isPrimitive(token: string): boolean {
    return primitives.includes(token);
}

export function getPrimitives(prim: string): any {
    const match: Map<string, any> = new Map<string, any>();
    match["and"] = (a: Value, b: Value) => {
        if (a.is(ValueType.BOOLEAN) && b.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,
                ((a as SimpValue).value as boolean) && ((b as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function and`;
    };
    match["or"] = (a: Value, b: Value) => {
        if (a.is(ValueType.BOOLEAN) && b.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,
                ((a as SimpValue).value as boolean) || ((b as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function or`;
    };
    match["nand"] = (a: Value, b: Value) => {
        if (a.is(ValueType.BOOLEAN) && b.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,
                !(((a as SimpValue).value as boolean) && ((b as SimpValue).value as boolean)));
        }
        throw `Type dismatch when calling primitive function nand`;
    };
    match["not"] = (a: Value) => {
        if (a.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,!((a as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function not`;
    }
    // TODO
}
