"use strict";
const tokenize_1 = require("./tokenize");
const test_code = `
(define (a b) b)
`;
console.log(tokenize_1.tokenize(test_code, "").map(x => x.content).join(","));
//# sourceMappingURL=index.js.map