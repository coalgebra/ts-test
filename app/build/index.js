"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenize_1 = require("./tokenize");
const parse_1 = require("./parse");
const environment_1 = require("./environment");
const interact_1 = require("./interact");
const evaluate_1 = require("./evaluate");
const test_code = `
((lambda (x) x) 1)
`;
function test(code) {
    const env = new environment_1.Environment(null);
    const context = new interact_1.DefaultInteractContext();
    try {
        evaluate_1.evaluate(parse_1.parse(tokenize_1.tokenize(code, "")), env, x => console.log(x.print()), context);
    }
    catch (xxx) {
        console.error(xxx);
    }
}
// console.log(tokenize(test_code, "").map(x => x.content).join(","));
// console.log();
test(test_code);
//# sourceMappingURL=index.js.map