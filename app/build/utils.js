"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
class Context {
}
exports.Context = Context;
var ValueType;
(function (ValueType) {
    ValueType[ValueType["FUNCTION"] = 0] = "FUNCTION";
    ValueType[ValueType["BOOLEAN"] = 1] = "BOOLEAN";
    ValueType[ValueType["INTEGER"] = 2] = "INTEGER";
    ValueType[ValueType["CHARACTER"] = 3] = "CHARACTER";
    ValueType[ValueType["PAIR"] = 4] = "PAIR";
    ValueType[ValueType["NIL"] = 5] = "NIL";
    ValueType[ValueType["VOID"] = 6] = "VOID";
    ValueType[ValueType["CONTINUATION"] = 7] = "CONTINUATION";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
class CommandLineArguments {
}
exports.CommandLineArguments = CommandLineArguments;
class Value {
    constructor(type) {
        this.type = type;
    }
}
exports.Value = Value;
class SimpValue extends Value {
    constructor(type, value) {
        super(type);
        this.value = value;
    }
    is(cond) {
        return this.type === cond;
    }
    eq(val) {
        return this.value === val;
    }
    print() {
        return this.value === undefined ? "#<void>" : this.value.toString();
    }
}
exports.SimpValue = SimpValue;
class PairValue extends Value {
    constructor(car, cdr) {
        super(ValueType.PAIR);
        this.car = car;
        this.cdr = cdr;
    }
    is(cond) {
        // TODO
        return false;
    }
    eq(val) {
        return false;
    }
    print() {
        // TODO
        return "";
    }
}
exports.PairValue = PairValue;
class FuncValue extends Value {
    constructor(env, body, paramNames) {
        super(ValueType.FUNCTION);
        // create a new environment
        this.env = new environment_1.Environment(env);
        this.body = body;
        this.paramNames = paramNames;
    }
    is(cond) {
        return cond === ValueType.FUNCTION;
    }
    eq(val) {
        return false;
    }
    evaluate(parameters, context, cont) {
        // TODO
        return null;
    }
    print() {
        return "#<procedure>";
    }
}
exports.FuncValue = FuncValue;
class Continuation extends Value {
    constructor(cont) {
        super(ValueType.CONTINUATION);
        this.cont = cont;
    }
    eq(val) {
        return false;
    }
    is(cond) {
        return cond === ValueType.CONTINUATION;
    }
    print() {
        return "#<continuation>";
    }
}
exports.Continuation = Continuation;
//# sourceMappingURL=utils.js.map