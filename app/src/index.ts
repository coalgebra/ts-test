import {tokenize} from "./tokenize";
import {parse} from "./parse";
import {Environment} from "./environment";
import {DefaultInteractContext} from "./interact";
import {evaluate, test_evaluate} from "./evaluate";
import {desugar_test} from "./desugar";
import {simplify_test} from "./simplify";

const test_code =
`
((lambda (x y) (x y)) x y)
`;

// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(simplify_test(test_code));
