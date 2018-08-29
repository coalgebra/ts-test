"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class DefaultInteractContext {
    constructor() {
        this.VOID_VALUE = new utils_1.SimpValue(utils_1.ValueType.VOID);
        this.NIL_VALUE = new utils_1.SimpValue(utils_1.ValueType.NIL, "()");
    }
    output(content) {
        console.log(content);
    }
    readline() {
        return "";
    }
}
exports.DefaultInteractContext = DefaultInteractContext;
//# sourceMappingURL=interact.js.map