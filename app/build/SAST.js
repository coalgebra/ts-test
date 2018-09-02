"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SType;
(function (SType) {
    SType["DEFINE"] = "sdefine";
    SType["LAMBDA"] = "slambda";
    SType["SETBANG"] = "ssetbang";
    SType["APPLICATION"] = "sapply";
    SType["BEGIN"] = "sbegin";
    SType["IF"] = "sif";
    SType["IDENTIFIER"] = "sid";
    SType["VALUE"] = "svalue";
})(SType = exports.SType || (exports.SType = {}));
class SAST {
    constructor(type) {
        this.type = type;
    }
}
exports.SAST = SAST;
class SDefine extends SAST {
    constructor(identifier, body) {
        super(SType.DEFINE);
        this.identifier = identifier;
        this.body = body;
    }
    print() {
        return `(define ${this.identifier} ${this.body.print()})`;
    }
}
exports.SDefine = SDefine;
class SLambda extends SAST {
    constructor(parameters, body) {
        super(SType.LAMBDA);
        this.parameters = parameters;
        this.body = body;
    }
    print() {
        return `(lambda (${this.parameters.join(" ")}) ${this.body.print()})`;
    }
}
exports.SLambda = SLambda;
class SSetbang extends SAST {
    constructor(identifier, body) {
        super(SType.SETBANG);
        this.identifier = identifier;
        this.body = body;
    }
    print() {
        return `(set! ${this.identifier} ${this.body.print()})`;
    }
}
exports.SSetbang = SSetbang;
class SApply extends SAST {
    constructor(func, parameters) {
        super(SType.APPLICATION);
        this.func = func;
        this.parameters = parameters;
    }
    print() {
        return `(${this.func.print()} ${this.parameters.map(x => x.print()).join(" ")})`;
    }
}
exports.SApply = SApply;
class SIf extends SAST {
    constructor(cond, pass, fail) {
        super(SType.IF);
        this.cond = cond;
        this.pass = pass;
        this.fail = fail;
    }
    print() {
        return `(if ${this.cond.print()} ${this.pass.print()} ${this.fail.print()})`;
    }
}
exports.SIf = SIf;
class SBegin extends SAST {
    constructor(stmts) {
        super(SType.BEGIN);
        this.stmts = stmts;
    }
    print() {
        return `(begin ${this.stmts.map(x => x.print()).join(" ")})`;
    }
}
exports.SBegin = SBegin;
class SLiteral extends SAST {
    constructor(value) {
        super(SType.VALUE);
        this.value = value;
    }
    print() {
        return this.value.print();
    }
}
exports.SLiteral = SLiteral;
class SIdentifier extends SAST {
    constructor(name) {
        super(SType.IDENTIFIER);
        this.name = name;
    }
    print() {
        return this.name;
    }
}
exports.SIdentifier = SIdentifier;
//# sourceMappingURL=SAST.js.map