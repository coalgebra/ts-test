"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
// cps-style interpreter
function evaluate(ast, env, cont) {
    if (ast instanceof ast_1.Application) {
        if (ast.func instanceof ast_1.Identifer && constants_1.isPrimitive(ast.func.name)) {
            // no need for cps to primitives
            // TODO
        }
        else {
            evaluate(ast.func, env, (func) => {
                let parameters = [];
                for (let i = 0; i < ast.parameter.length; i++) {
                    evaluate(ast.parameter[i], env, (value) => {
                        parameters.push(value);
                    });
                }
                if (func.type !== utils_1.ValueType.FUNCTION) {
                    throw `Func of Application is not a function`;
                }
                cont(func.evaluate(parameters));
            });
        }
    }
    else if (ast instanceof ast_1.Begin) {
        for (let i = 0; i < ast.stmts.length - 1; i++) {
            evaluate(ast.stmts[i], env, (_) => {
                // DO NOTHING
            });
        }
        evaluate(ast.stmts[ast.stmts.length - 1], env, (res) => {
            cont(res);
        });
    }
    else if (ast instanceof ast_1.Define) {
        evaluate(ast.body, env, (body) => {
            env.define(ast.identifer, body);
            cont(utils_1.VOID_VALUE);
        });
    }
    else if (ast instanceof ast_1.SetBang) {
        evaluate(ast.body, env, (body) => {
            env.modify(ast.identifer, body);
            cont(utils_1.VOID_VALUE);
        });
    }
    else if (ast instanceof ast_1.Lambda) {
        cont(new utils_1.FuncValue(env, ast.body, ast.parameters));
    }
    else if (ast instanceof ast_1.IfStmt) {
        evaluate(ast.cond, env, (cond) => {
            if (cond.is(true)) {
                evaluate(ast.pass, env, cont);
            }
            else {
                evaluate(ast.fail, env, cont);
            }
        });
    }
    else if (ast instanceof ast_1.CondStmt) {
        let flag = false;
        for (let i = 0; i < ast.cases.length && !flag; i++) {
            evaluate(ast.cases[i][0], env, (res) => {
                if (res.is(true)) {
                    evaluate(ast.cases[i][1], env, cont);
                    flag = true;
                }
            });
        }
        if (!flag) {
            cont(utils_1.VOID_VALUE);
        }
    }
    else if (ast instanceof ast_1.Identifer) {
        cont(env.find(ast.name));
    }
    else if (ast instanceof ast_1.IntegerLiteral) {
        cont(new utils_1.SimpValue(utils_1.ValueType.INTEGER, ast.value));
    }
    else if (ast instanceof ast_1.BooleanLiteral) {
        cont(new utils_1.SimpValue(utils_1.ValueType.BOOLEAN, ast.value));
    }
    else if (ast instanceof ast_1.CharLiteral) {
        cont(new utils_1.SimpValue(utils_1.ValueType.CHARACTER, ast.value));
    }
    else if (ast instanceof ast_1.NilLiteral) {
        cont(new utils_1.SimpValue(utils_1.ValueType.NIL, "()"));
    }
    else if (ast instanceof ast_1.PairLiteral) {
        evaluate(ast.car, env, (car) => {
            evaluate(ast.cdr, env, (cdr) => {
                cont(new utils_1.PairValue(car, cdr));
            });
        });
    }
    else {
        throw `Unrecognized ast ${ast.print()} when evaluating`;
    }
}
exports.evaluate = evaluate;
function repl() {
}
exports.repl = repl;
//# sourceMappingURL=evaluate.js.map