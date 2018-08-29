"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const environment_1 = require("./environment");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
// cps-style interpreter
function evaluate(ast, env, cont, context) {
    if (ast instanceof ast_1.Application) {
        if (ast.func instanceof ast_1.Identifer && constants_1.isPrimitive(ast.func.name)) {
            // call with current continuation
            if (ast.func.name === "call/cc") {
                if (ast.parameter.length !== 1)
                    throw `call/cc only need one parameter`;
                evaluate(ast.parameter[0], env, (fun) => {
                    if (fun instanceof utils_1.FuncValue) {
                        fun.evaluate([new utils_1.Continuation(cont)], context, cont);
                    }
                    else if (fun instanceof utils_1.Continuation) {
                        fun.cont(new utils_1.Continuation(cont));
                    }
                    else {
                        throw `Parameter of call/cc must be a function`;
                    }
                }, context);
            }
            else {
                const fun = constants_1.getPrimitives(ast.func.name, context);
                let i = 0;
                let parameters = [];
                const _cont = (val) => {
                    parameters.push(val);
                    if (i < ast.parameter.length - 1) {
                        i++;
                        evaluate(ast.parameter[i], env, _cont, context);
                    }
                    else {
                        cont(fun(parameters));
                    }
                };
                if (ast.parameter.length > 0) {
                    evaluate(ast.parameter[0], env, _cont, context);
                }
                else {
                    cont(fun(parameters));
                }
            }
        }
        else {
            evaluate(ast.func, env, (func) => {
                let parameters = [];
                let i = 0;
                const _cont = (val) => {
                    parameters.push(val);
                    if (i < ast.parameter.length - 1) {
                        i++;
                        evaluate(ast.parameter[i], env, _cont, context);
                    }
                    else {
                        if (func instanceof utils_1.Continuation) {
                            if (parameters.length !== 1) {
                                throw `Parameter numbers for continuation must be one`;
                            }
                            func.cont(parameters[0]);
                        }
                        else {
                            if (func.type !== utils_1.ValueType.FUNCTION) {
                                throw `Func of Application is not a function`;
                            }
                            func.evaluate(parameters, context, cont);
                        }
                    }
                };
                if (ast.parameter.length > 0) {
                    evaluate(ast.parameter[0], env, _cont, context);
                }
                else {
                    if (func instanceof utils_1.Continuation) {
                        if (parameters.length !== 1) {
                            throw `Parameter numbers for continuation must be one`;
                        }
                        func.cont(parameters[0]);
                    }
                    else {
                        if (func.type !== utils_1.ValueType.FUNCTION) {
                            throw `Func of Application is not a function`;
                        }
                        func.evaluate([], context, cont);
                    }
                }
            }, context);
        }
    }
    else if (ast instanceof ast_1.Begin) {
        const new_env = new environment_1.Environment(env);
        let i = 0;
        const _cont = (val) => {
            if (i < ast.stmts.length - 1) {
                i++;
                evaluate(ast.stmts[i], new_env, _cont, context);
            }
            else {
                cont(val);
            }
        };
        evaluate(ast.stmts[i], new_env, _cont, context);
    }
    else if (ast instanceof ast_1.Define) {
        evaluate(ast.body, env, (body) => {
            env.define(ast.identifer, body);
            cont(context.VOID_VALUE);
        }, context);
    }
    else if (ast instanceof ast_1.SetBang) {
        evaluate(ast.body, env, (body) => {
            env.modify(ast.identifer, body);
            cont(context.VOID_VALUE);
        }, context);
    }
    else if (ast instanceof ast_1.Lambda) {
        cont(new utils_1.FuncValue(env, ast.body, ast.parameters));
    }
    else if (ast instanceof ast_1.IfStmt) {
        evaluate(ast.cond, env, (cond) => {
            if (cond.eq(true)) {
                evaluate(ast.pass, env, cont, context);
            }
            else {
                evaluate(ast.fail, env, cont, context);
            }
        }, context);
    }
    else if (ast instanceof ast_1.CondStmt) {
        let i = 0;
        const _cont = (value) => {
            if (value.eq(true)) {
                evaluate(ast.cases[i][1], env, cont, context);
            }
            else if (i < ast.cases.length - 1) {
                i++;
                evaluate(ast.cases[i][0], env, _cont, context);
            }
            else {
                cont(context.VOID_VALUE);
            }
        };
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
        cont(context.NIL_VALUE);
    }
    else if (ast instanceof ast_1.PairLiteral) {
        evaluate(ast.car, env, (car) => {
            evaluate(ast.cdr, env, (cdr) => {
                cont(new utils_1.PairValue(car, cdr));
            }, context);
        }, context);
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