import {tokenize} from "./tokenize";
import {parse} from "./parse";
import {Environment} from "./environment";
import {DefaultInteractContext} from "./interact";
import {evaluate, test_evaluate} from "./evaluate";
import {desugar_test} from "./desugar";

const test_code =
`
(letrec 
    ((x (lambda (n) 
        (if (eq? n 0) 0 (y (- n 1)))))
     (y (lambda (n) 
        (if (eq? n 0) 1 (x (- n 1))))))
    (x 6))
`;

// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(test_evaluate(test_code));
