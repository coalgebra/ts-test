"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenize_1 = require("./tokenize");
const parse_1 = require("./parse");
const test_code = `
(define a b)
(fuck (+ 1 2) 2)
`;
// console.log(tokenize(test_code, "").map(x => x.content).join(","));
console.log(parse_1.parse(tokenize_1.tokenize(test_code, "")).print());
//# sourceMappingURL=index.js.map