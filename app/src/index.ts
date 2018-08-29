import {tokenize} from "./tokenize";
import {parse} from "./parse";
import {Environment} from "./environment";
import {DefaultInteractContext} from "./interact";
import {evaluate} from "./evaluate";

const test_code =
`
((lambda (x) x) 1)
`;

function test(code: string) {
    const env = new Environment(null);
    const context = new DefaultInteractContext();
    try {
        evaluate(parse(tokenize(code, "")), env, x => console.log(x.print()), context);
    } catch (xxx) {
        console.error(xxx);
    }
}

// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
test(test_code);
