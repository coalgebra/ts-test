"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return false;
    }
}
exports.SimpValue = SimpValue;
exports.VOID_VALUE = new SimpValue(ValueType.VOID, null);
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
}
exports.PairValue = PairValue;
class FuncValue extends Value {
    constructor(env, body, paramNames) {
        super(ValueType.FUNCTION);
        this.env = env;
        this.body = body;
        this.paramNames = paramNames;
    }
    is(cond) {
        // TODO
        return false;
    }
    evaluate(parameters) {
        // TODO
        return null;
    }
}
exports.FuncValue = FuncValue;
//# sourceMappingURL=utils.js.map