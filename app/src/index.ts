import {tokenize} from "./tokenize";
import {parse} from "./parse";
import {Environment} from "./environment";
import {DefaultInteractContext} from "./interact";
import {evaluate, test_evaluate} from "./evaluate";
import {desugar_test} from "./desugar";

const test_code =
`
(cond (#f 1) (else 2))
`;

// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(parse(tokenize(test_code)).print());
