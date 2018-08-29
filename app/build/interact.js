"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("./value");
const value_2 = require("./value");
class DefaultInteractContext {
    constructor() {
        this.VOID_VALUE = new value_2.SimpValue(value_1.ValueType.VOID);
        this.NIL_VALUE = new value_2.SimpValue(value_1.ValueType.NIL, "()");
    }
    output(content) {
        console.log(content);
    }
    readline() {
        // FIXME: not supported right now
        return "";
    }
}
exports.DefaultInteractContext = DefaultInteractContext;
class TestInteractContext {
    constructor() {
        this.result = "";
        this.VOID_VALUE = new value_2.SimpValue(value_1.ValueType.VOID);
        this.NIL_VALUE = new value_2.SimpValue(value_1.ValueType.NIL, "()");
    }
    output(content) {
        this.result += content;
    }
    readline() {
        return "";
    }
}
exports.TestInteractContext = TestInteractContext;
//# sourceMappingURL=interact.js.map