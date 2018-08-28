"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SType;
(function (SType) {
    SType[SType["DEFINE"] = 0] = "DEFINE";
    SType[SType["LAMBDA"] = 1] = "LAMBDA";
    SType[SType["SETBANG"] = 2] = "SETBANG";
    SType[SType["APPLICATION"] = 3] = "APPLICATION";
    SType[SType["BEGIN"] = 4] = "BEGIN";
})(SType = exports.SType || (exports.SType = {}));
class SAST {
}
exports.SAST = SAST;
class SDefine extends SAST {
}
exports.SDefine = SDefine;
class SLambda extends SAST {
}
exports.SLambda = SLambda;
class SSetbang extends SAST {
}
exports.SSetbang = SSetbang;
class SApply extends SAST {
}
exports.SApply = SApply;
class SBegin extends SAST {
}
exports.SBegin = SBegin;
class SLiteral extends SAST {
}
exports.SLiteral = SLiteral;
//# sourceMappingURL=SAST.js.map