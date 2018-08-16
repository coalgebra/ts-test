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
}

export class Begin extends AST {
    stmts: AST[];
    constructor(begin: CodePosition, end: CodePosition, stmts: AST[]) {
        super(begin, end);
        this.stmts = stmts;
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
}

export class Define extends AST {
    identifer: string;
    body: AST;

    constructor(begin: CodePosition, end: CodePosition, identifer: string, body: AST) {
        super(begin, end);
        this.identifer = identifer;
        this.body = body;
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
}

export class Identifer extends AST {
    name: string;

    constructor(token: Token) {
        super(token.begin, token.end);
        this.name = token.value as string;
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
}

export class BooleanLiteral extends Literal {
    value: boolean;

    constructor(token: Token) {
        super(token.begin, token.end, ValueType.BOOLEAN);
        assert(token.token_type === TokenType.BOOLEAN_LITERAL);
        this.value = token.value as boolean;
    }
}

export class CharLiteral extends Literal {
    value: string;
    constructor(token: Token) {
        super(token.begin, token.end, ValueType.CHARACTER);
        assert(token.token_type === TokenType.CHAR_LITERAL);
        this.value = token.value as string;
    }
}

export class NilLiteral extends Literal {
    constructor(begin: CodePosition, end: CodePosition) {
        super(begin, end, ValueType.NIL);
    }
}

export class PairLiteral extends Literal {
    car: Literal;
    cdr: Literal;

    constructor(begin: CodePosition, end: CodePosition, car: Literal, cdr: Literal) {
        super(begin, end, ValueType.PAIR);
        this.car = car;
        this.cdr = cdr;
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
}

export class CondStmt extends AST {
    cases: [AST, AST][];
    constructor(begin: CodePosition, end: CodePosition, cases: [AST, AST][]) {
        super(begin, end);
        this.cases = cases;
    }
}

