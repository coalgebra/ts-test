import {tokenize} from "./tokenize";
import {parse} from "./parse";
import {Environment} from "./environment";
import {DefaultInteractContext} from "./interact";
import {evaluate, test_evaluate} from "./evaluate";

const test_code =
`
(nand #t #f)
`;

// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
console.log(test_evaluate(test_code));
