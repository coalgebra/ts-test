"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenize_1 = require("./tokenize");
const parse_1 = require("./parse");
const test_code = `
(cond (#f 1) (else 2))
`;
// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(parse_1.parse(tokenize_1.tokenize(test_code)).print());
//# sourceMappingURL=index.js.map