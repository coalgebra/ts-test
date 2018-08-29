import {Environment} from "./environment";
import {AST} from "./ast";
import {InteractContext} from "./interact";


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
    VOID,
    CONTINUATION, // dirty hack
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
    abstract is(cond : ValueType): boolean;
    abstract eq(val: string | number | boolean): boolean;
    abstract print(): string;
}

export class SimpValue extends Value {
    value?: boolean | number | string;

    constructor(type: ValueType, value?: boolean | number | string) {
        super(type);
        this.value = value;
    }

    is(cond: ValueType): boolean {
        return this.type === cond;
    }

    eq(val: boolean | number | string): boolean {
        return this.value === val;
    }

    print(): string {
        return this.value === undefined ? "#<void>" : this.value.toString();
    }
}

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

    eq(val: string | number | boolean): boolean {
        return false;
    }

    print(): string {
        // TODO
        return "";
    }
}

export class FuncValue extends Value {
    env: Environment;
    body: AST;
    paramNames: string[];

    constructor(env: Environment, body: AST, paramNames: string[]) {
        super(ValueType.FUNCTION);
        // create a new environment
        this.env = new Environment(env);
        this.body = body;
        this.paramNames = paramNames;
    }

    is(cond: ValueType | boolean | number | string): boolean {
        return cond === ValueType.FUNCTION;
    }

    eq(val: string | number | boolean): boolean {
        return false;
    }

    evaluate(parameters: Value[], context: InteractContext, cont: (val: Value) => any): Value {
        // TODO
        return null;
    }

    print(): string {
        return "#<procedure>";
    }
}

export class Continuation extends Value {
    cont: (val: Value) => any;
    constructor(cont: (val: Value) => any) {
        super(ValueType.CONTINUATION);
        this.cont = cont;
    }

    eq(val: string | number | boolean): boolean {
        return false;
    }

    is(cond: ValueType | boolean | number | string): boolean {
        return cond === ValueType.CONTINUATION;
    }
    print(): string {
        return "#<continuation>";
    }
}


