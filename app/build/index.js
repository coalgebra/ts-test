"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simplify_1 = require("./simplify");
const test_code = `
((lambda (x y) (x y)) x y)
`;
// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(simplify_1.simplify_test(test_code));
//# sourceMappingURL=index.js.map