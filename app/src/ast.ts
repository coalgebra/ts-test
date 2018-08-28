import {ValueType} from "./utils";
import {CodePosition, Token, TokenType} from "./tokenize";
import * as assert from "assert";

export abstract class AST {
    // the position of the AST
    begin: CodePosition;
    end: CodePosition;

    protected constructor(begin: CodePosition, end: CodePosition) {
        this.begin = begin;
        this.end = end;
    }

    public abstract print(): string;
}

export class Begin extends AST {
    stmts: AST[];
    constructor(begin: CodePosition, end: CodePosition, stmts: AST[]) {
        super(begin, end);
        this.stmts = stmts;
    }

    print(): string {
        return `(begin ${this.stmts.map(x => x.print()).join(" ")})`;
    }
}

export class Lambda extends AST {
    parameters: string[];
    body: AST;

    constructor(begin: CodePosition, end: CodePosition, parameters: string[], body: AST) {
        super(begin, end);
        this.parameters = parameters;
        this.body = body;
    }

    print(): string {
        return `(lambda (${this.parameters.join(" ")}) ${this.body.print()})`;
    }
}

export class Define extends AST {
    identifer: string;
    body: AST;

    constructor(begin: CodePosition, end: CodePosition, identifer: string, body: AST) {
        super(begin, end);
        this.identifer = identifer;
        this.body = body;
    }

    print(): string {
        return `(define ${this.identifer} ${this.body.print()})`;
    }
}

export class SetBang extends AST {
    identifer: string;
    body: AST;

    constructor(begin: CodePosition, end: CodePosition, identifer: string, body: AST) {
        super(begin, end);
        this.identifer = identifer;
        this.body = body;
    }

    print(): string {
        return `(set! ${this.identifer} ${this.body.print()})`;
    }
}

export class Application extends AST {
    func: AST;
    parameter: AST[];

    constructor(begin: CodePosition, end: CodePosition, func: AST, parameter: AST[]) {
        super(begin, end);
        this.func = func;
        this.parameter = parameter;
    }

    print(): string {
        return `(${this.func.print()} ${this.parameter.map(x => x.print()).join(" ")})`;
    }
}

export class Identifer extends AST {
    name: string;

    constructor(token: Token) {
        super(token.begin, token.end);
        this.name = token.value as string;
    }

    print(): string {
        return this.name;
    }
}

export abstract class Literal extends AST {
    valueType: ValueType;

    protected constructor(begin: CodePosition, end: CodePosition, valueType: ValueType) {
        super(begin, end);
        this.valueType = valueType;
    }
}

export class IntegerLiteral extends Literal {
    value: number;

    constructor(token: Token) {
        super(token.begin, token.end, ValueType.INTEGER);
        assert(token.token_type === TokenType.INTEGER_LITERAL);
        this.value = token.value as number;
    }

    print(): string {
        return this.value.toString();
    }
}

export class BooleanLiteral extends Literal {
    value: boolean;

    constructor(token: Token) {
        super(token.begin, token.end, ValueType.BOOLEAN);
        assert(token.token_type === TokenType.BOOLEAN_LITERAL);
        this.value = token.value as boolean;
    }

    print(): string {
        return this.value ? "#t" : "#f";
    }
}

export class CharLiteral extends Literal {
    value: string;
    constructor(token: Token) {
        super(token.begin, token.end, ValueType.CHARACTER);
        assert(token.token_type === TokenType.CHAR_LITERAL);
        this.value = token.value as string;
    }

    print(): string {
        return `#\\${this.value}`;
    }
}

export class NilLiteral extends Literal {
    constructor(begin: CodePosition, end: CodePosition) {
        super(begin, end, ValueType.NIL);
    }

    print(): string {
        return "'()";
    }
}

export class PairLiteral extends Literal {
    car: AST;
    cdr: AST;

    constructor(car: AST, cdr: AST) {
        super(car.begin, cdr.end, ValueType.PAIR);
        this.car = car;
        this.cdr = cdr;
    }

    print(): string {
        return `(cons ${this.car.print()} ${this.cdr.print()})`;
    }
}

export class IfStmt extends AST {
    cond: AST;
    pass: AST;
    fail: AST;

    constructor(begin: CodePosition, end: CodePosition, cond: AST, pass: AST, fail: AST) {
        super(begin, end);
        this.cond = cond;
        this.pass = pass;
        this.fail = fail;
    }


    print(): string {
        return `(if ${this.cond.print()} ${this.pass.print()} ${this.fail.print()})`;
    }
}

export class CondStmt extends AST {
    cases: [AST, AST][];
    constructor(begin: CodePosition, end: CodePosition, cases: [AST, AST][]) {
        super(begin, end);
        this.cases = cases;
    }

    print(): string {
        return `(cond ${this.cases.map(pair => `(${pair[0].print()} ${pair[1].print()})`).join(" ")})`;
    }
}

