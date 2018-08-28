import {Environment} from "./environment";
import {AST} from "./ast";


export class Context {
    // TODO
}

export enum ValueType {
    FUNCTION,
    BOOLEAN,
    INTEGER,
    CHARACTER, // TODO
    PAIR,
    NIL, // ()
    VOID
}

export class CommandLineArguments {
    cps_flag: boolean;
    curry_flag: boolean;
    fold_flag: boolean;
    output_file: string;
    // TODO
}

export abstract class Value {
    type: ValueType;
    protected constructor(type: ValueType) {
        this.type = type;
    }
    abstract is(cond : ValueType | boolean | number | string): boolean;
}

export class SimpValue extends Value {
    value?: boolean | number | string;

    constructor(type: ValueType, value: boolean | number | string) {
        super(type);
        this.value = value;
    }

    is(cond: ValueType | boolean | number | string): boolean {
        return false;
    }
}

export const VOID_VALUE = new SimpValue(ValueType.VOID, null);


export class PairValue extends Value {
    car: Value;
    cdr: Value;

    constructor(car: Value, cdr: Value) {
        super(ValueType.PAIR);
        this.car = car;
        this.cdr = cdr;
    }

    is(cond: ValueType | boolean | number | string): boolean {
        // TODO
        return false;
    }
}

export class FuncValue extends Value {
    env: Environment;
    body: AST;
    paramNames: string[];

    constructor(env: Environment, body: AST, paramNames: string[]) {
        super(ValueType.FUNCTION);
        this.env = env;
        this.body = body;
        this.paramNames = paramNames;
    }

    is(cond: ValueType | boolean | number | string): boolean {
        // TODO
        return false;
    }

    evaluate(parameters: Value[]): Value {
        // TODO
        return null;
    }
}



