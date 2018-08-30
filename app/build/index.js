"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluate_1 = require("./evaluate");
const test_code = `
(nand #t #f)
`;
// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(evaluate_1.test_evaluate(test_code));
//# sourceMappingURL=index.js.map