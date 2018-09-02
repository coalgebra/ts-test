"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CpsContext {
    constructor() {
        this.counter = 0;
    }
    genSymbol(prefix, suffix = "") {
        return `${prefix}$${this.counter++}${suffix}`;
    }
}
exports.CpsContext = CpsContext;
function cps_transform(ast) {
    return null;
}
exports.cps_transform = cps_transform;
//# sourceMappingURL=CPS.js.map