import {tokenize} from "./tokenize";
import {parse} from "./parse";

const test_code =
`
(define a b)
`;

// console.log(tokenize(test_code, "").map(x => x.content).join(","));
console.log(parse(tokenize(test_code, "")));
