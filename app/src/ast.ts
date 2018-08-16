import {Context, ValueType} from "./utils";
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

    constructor(begin: CodePosition, end: CodePosition, name: string) {
        super(begin, end);
        this.name = name;
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

