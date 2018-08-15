import {tokenize} from "./tokenize";

const test_code =
`
(define (a b) b)
`;

console.log(tokenize(test_code, "").map(x => x.content).join(","));
