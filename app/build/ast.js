"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("./value");
const tokenize_1 = require("./tokenize");
const assert = require("assert");
class AST {
    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }
}
exports.AST = AST;
class Begin extends AST {
    constructor(begin, end, stmts) {
        super(begin, end);
        this.stmts = stmts;
    }
    print() {
        return `(begin ${this.stmts.map(x => x.print()).join(" ")})`;
    }
}
exports.Begin = Begin;
class Lambda extends AST {
    constructor(begin, end, parameters, body) {
        super(begin, end);
        this.parameters = parameters;
        this.body = body;
    }
    print() {
        return `(lambda (${this.parameters.join(" ")}) ${this.body.print()})`;
    }
}
exports.Lambda = Lambda;
class Define extends AST {
    constructor(begin, end, identifer, body) {
        super(begin, end);
        this.identifer = identifer;
        this.body = body;
    }
    print() {
        return `(define ${this.identifer} ${this.body.print()})`;
    }
}
exports.Define = Define;
class SetBang extends AST {
    constructor(begin, end, identifer, body) {
        super(begin, end);
        this.identifer = identifer;
        this.body = body;
    }
    print() {
        return `(set! ${this.identifer} ${this.body.print()})`;
    }
}
exports.SetBang = SetBang;
class Application extends AST {
    constructor(begin, end, func, parameter) {
        super(begin, end);
        this.func = func;
        this.parameter = parameter;
    }
    print() {
        return `(${this.func.print()} ${this.parameter.map(x => x.print()).join(" ")})`;
    }
}
exports.Application = Application;
class Identifer extends AST {
    constructor(token) {
        super(token.begin, token.end);
        this.name = token.value;
    }
    print() {
        return this.name;
    }
}
exports.Identifer = Identifer;
class Let extends AST {
    constructor(begin, end, bindings, body, star = false) {
        super(begin, end);
        this.bindings = bindings;
        this.body = body;
        this.star = star;
    }
    print() {
        return `(let${this.star ? "*" : ""} (${this.bindings.map(pair => `(${pair[0]} ${pair[1].print()})`).join(" ")}) ${this.body.print()}`;
    }
}
exports.Let = Let;
class Literal extends AST {
    constructor(begin, end, valueType) {
        super(begin, end);
        this.valueType = valueType;
    }
}
exports.Literal = Literal;
class IntegerLiteral extends Literal {
    constructor(token) {
        super(token.begin, token.end, value_1.ValueType.INTEGER);
        assert(token.token_type === tokenize_1.TokenType.INTEGER_LITERAL);
        this.value = token.value;
    }
    print() {
        return this.value.toString();
    }
}
exports.IntegerLiteral = IntegerLiteral;
class BooleanLiteral extends Literal {
    constructor(token) {
        super(token.begin, token.end, value_1.ValueType.BOOLEAN);
        assert(token.token_type === tokenize_1.TokenType.BOOLEAN_LITERAL);
        this.value = token.value;
    }
    print() {
        return this.value ? "#t" : "#f";
    }
}
exports.BooleanLiteral = BooleanLiteral;
class CharLiteral extends Literal {
    constructor(token) {
        super(token.begin, token.end, value_1.ValueType.CHARACTER);
        assert(token.token_type === tokenize_1.TokenType.CHAR_LITERAL);
        this.value = token.value;
    }
    print() {
        return `#\\${this.value}`;
    }
}
exports.CharLiteral = CharLiteral;
class NilLiteral extends Literal {
    constructor(begin, end) {
        super(begin, end, value_1.ValueType.NIL);
    }
    print() {
        return "'()";
    }
}
exports.NilLiteral = NilLiteral;
class PairLiteral extends Literal {
    constructor(car, cdr) {
        super(car.begin, cdr.end, value_1.ValueType.PAIR);
        this.car = car;
        this.cdr = cdr;
    }
    print() {
        return `(cons ${this.car.print()} ${this.cdr.print()})`;
    }
}
exports.PairLiteral = PairLiteral;
class IfStmt extends AST {
    constructor(begin, end, cond, pass, fail) {
        super(begin, end);
        this.cond = cond;
        this.pass = pass;
        this.fail = fail;
    }
    print() {
        return `(if ${this.cond.print()} ${this.pass.print()} ${this.fail.print()})`;
    }
}
exports.IfStmt = IfStmt;
class CondStmt extends AST {
    constructor(begin, end, cases) {
        super(begin, end);
        let flag = false;
        for (let i = 0; i < cases.length; i++) {
            const head = cases[i][0];
            if (head instanceof Identifer) {
                if (head.name === "else" && i !== cases.length - 1) {
                    throw `Else branch must be the last one of condition statement at ${head.begin.toString()}`;
                }
                if (head.name === "else" && flag) {
                    throw `Duplicate else at ${head.begin.toString()}`;
                }
                if (head.name === "else") {
                    flag = true;
                    cases[i][0] = new BooleanLiteral(new tokenize_1.Token(head.begin, head.end, "#t", tokenize_1.TokenType.BOOLEAN_LITERAL, true));
                }
            }
        }
        this.cases = cases;
    }
    print() {
        return `(cond ${this.cases.map(pair => `(${pair[0].print()} ${pair[1].print()})`).join(" ")})`;
    }
}
exports.CondStmt = CondStmt;
class Letrec extends AST {
    constructor(begin, end, bindings, body) {
        super(begin, end);
        this.bindings = bindings;
        this.body = body;
    }
    print() {
        return `(letrec (${this.bindings.map(pair => `(${pair[0]} ${pair[1].print()})`).join(" ")}) ${this.body.print()}`;
    }
}
exports.Letrec = Letrec;
//# sourceMappingURL=ast.js.map