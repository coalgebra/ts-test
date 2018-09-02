import {AST, Literal} from "./ast";
import {Value} from "./value";
import {codegen} from "./codegen";

export enum SType {
    DEFINE = "sdefine",
    LAMBDA = "slambda",
    SETBANG = "ssetbang",
    APPLICATION = "sapply",
    BEGIN = "sbegin",
    IF = "sif",
    IDENTIFIER = "sid",
    VALUE = "svalue",
}

export abstract class SAST {
    type: SType;
    protected constructor(type: SType) {
        this.type = type;
    }
    abstract print(): string;
}

export class SDefine extends SAST {
    identifier: string;
    body: SAST;

    constructor(identifier: string, body: SAST) {
        super(SType.DEFINE);
        this.identifier = identifier;
        this.body = body;
    }

    print(): string {
        return `(define ${this.identifier} ${this.body.print()})`;
    }
}

export class SLambda extends SAST {
    parameters: string[];
    body: SAST;

    constructor(parameters: string[], body: SAST) {
        super(SType.LAMBDA);
        this.parameters = parameters;
        this.body = body;
    }

    print(): string {
        return `(lambda (${this.parameters.join(" ")}) ${this.body.print()})`;
    }
}

export class SSetbang extends SAST {
    identifier: string;
    body: SAST;
    constructor(identifier: string, body: SAST) {
        super(SType.SETBANG);
        this.identifier = identifier;
        this.body = body;
    }

    print(): string {
        return `(set! ${this.identifier} ${this.body.print()})`;
    }
}

export class SApply extends SAST {
    func: SAST;
    parameters: SAST[];
    constructor(func: SAST, parameters: SAST[]) {
        super(SType.APPLICATION);
        this.func = func;
        this.parameters = parameters;
    }
    print(): string {
        return `(${this.func.print()} ${this.parameters.map(x => x.print()).join(" ")})`;
    }
}

export class SIf extends SAST {
    cond: SAST;
    pass: SAST;
    fail: SAST;

    constructor(cond: SAST, pass: SAST, fail: SAST) {
        super(SType.IF);
        this.cond = cond;
        this.pass = pass;
        this.fail = fail;
    }

    print(): string {
        return `(if ${this.cond.print()} ${this.pass.print()} ${this.fail.print()})`;
    }
}

export class SBegin extends SAST {
    stmts: SAST[];
    constructor(stmts: SAST[]) {
        super(SType.BEGIN);
        this.stmts = stmts;
    }

    print(): string {
        return `(begin ${this.stmts.map(x => x.print()).join(" ")})`;
    }
}

export class SLiteral extends SAST {
    value: Value;

    constructor(value: Value) {
        super(SType.VALUE);
        this.value = value;
    }

    print(): string {
        return this.value.print();
    }
}

export class SIdentifier extends SAST {
    name: string;

    constructor(name: string) {
        super(SType.IDENTIFIER);
        this.name = name;
    }

    print(): string {
        return this.name;
    }
}
