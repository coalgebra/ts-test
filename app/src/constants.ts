import {SimpValue, Value, ValueType} from "./utils";
import {InteractContext} from "./interact";

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
    "call/cc",
];

export function isKeyword(token: string): boolean {
    return keywords.includes(token);
}

export function isPrimitive(token: string): boolean {
    return primitives.includes(token);
}

export function getPrimitives(prim: string, context: InteractContext): (parameters: Value[]) => Value {
    const match: Map<string, (parameters: Value[]) => Value> = new Map<string, (parameters: Value[]) => Value>();
    match.set("and", (parameters: Value[]) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <and> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(ValueType.BOOLEAN) && b.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,
                ((a as SimpValue).value as boolean) && ((b as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function <and>`;
    });
    match.set("or", (parameters: Value[]) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <or> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(ValueType.BOOLEAN) && b.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,
                ((a as SimpValue).value as boolean) || ((b as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function <or>`;
    });
    match.set("nand", (parameters: Value[]) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <nand> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(ValueType.BOOLEAN) && b.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN,
                !((a as SimpValue).value as boolean) && ((b as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function <nand>`;
    });
    match.set("not", (parameters: Value[]) => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <not> must be 1`;
        }
        const a = parameters[0];
        if (a.is(ValueType.BOOLEAN)) {
            return new SimpValue(ValueType.BOOLEAN, !((a as SimpValue).value as boolean));
        }
        throw `Type dismatch when calling primitive function <not>`;
    });
    match.set("display", (parameters: Value[]) => {
        if (parameters.length !== 1) {
            throw `Parameter number of primitive <display> must be 1`;
        }
        context.output(parameters[0].print());
        return context.VOID_VALUE;
    });
    match.set("+", (parameters: Value[]) => {
        if (parameters.length !== 2) {
            throw `Parameter number of primitive <add> must be 2`;
        }
        const a = parameters[0];
        const b = parameters[1];
        if (a.is(ValueType.INTEGER) && b.is(ValueType.INTEGER)) {
            return new SimpValue(ValueType.INTEGER,
                ((a as SimpValue).value as number) + ((b as SimpValue).value as number));
        }
        throw `Type dismatch when calling primitive function <add>`;
    });
    if (match.has(prim)) {
        return match.get(prim);
    }
    throw `${prim} is not supported in interact environment right now`;
}
