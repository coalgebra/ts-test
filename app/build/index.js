"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluate_1 = require("./evaluate");
const test_code = `
(letrec 
    ((x (lambda (n) 
        (if (eq? n 0) 0 (y (- n 1)))))
     (y (lambda (n) 
        (if (eq? n 0) 1 (x (- n 1))))))
    (x 6))
`;
// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(evaluate_1.test_evaluate(test_code));
//# sourceMappingURL=index.js.map