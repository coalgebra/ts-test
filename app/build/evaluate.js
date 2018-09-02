"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const environment_1 = require("./environment");
const value_1 = require("./value");
const constants_1 = require("./constants");
const interact_1 = require("./interact");
const parse_1 = require("./parse");
const tokenize_1 = require("./tokenize");
// cps-style interpreter
function evaluate(ast, env, cont, context) {
    if (ast instanceof ast_1.Application) {
        if (ast.func instanceof ast_1.Identifer && constants_1.isPrimitive(ast.func.name)) {
            // call with current continuation
            if (ast.func.name === "call/cc") {
                if (ast.parameter.length !== 1)
                    throw `call/cc only need one parameter`;
                return evaluate(ast.parameter[0], env, (fun) => {
                    if (fun instanceof value_1.FuncValue) {
                        return fun.apply([new value_1.Continuation(cont)], context, cont);
                    }
                    else if (fun instanceof value_1.Continuation) {
                        return fun.cont(new value_1.Continuation(cont));
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
                        return evaluate(ast.parameter[i], env, _cont, context);
                    }
                    else {
                        return cont(fun(parameters));
                    }
                };
                if (ast.parameter.length > 0) {
                    return evaluate(ast.parameter[0], env, _cont, context);
                }
                else {
                    return cont(fun(parameters));
                }
            }
        }
        else {
            return evaluate(ast.func, env, (func) => {
                let parameters = [];
                let i = 0;
                const _cont = (val) => {
                    parameters.push(val);
                    if (i < ast.parameter.length - 1) {
                        i++;
                        return evaluate(ast.parameter[i], env, _cont, context);
                    }
                    else {
                        if (func instanceof value_1.Continuation) {
                            if (parameters.length !== 1) {
                                throw `Parameter numbers for continuation must be one`;
                            }
                            return func.cont(parameters[0]);
                        }
                        else {
                            if (func.type !== value_1.ValueType.FUNCTION) {
                                throw `Func of Application is not a function`;
                            }
                            return func.apply(parameters, context, cont);
                        }
                    }
                };
                if (ast.parameter.length > 0) {
                    return evaluate(ast.parameter[0], env, _cont, context);
                }
                else {
                    if (func instanceof value_1.Continuation) {
                        if (parameters.length !== 1) {
                            throw `Parameter numbers for continuation must be one`;
                        }
                        return func.cont(parameters[0]);
                    }
                    else {
                        if (func.type !== value_1.ValueType.FUNCTION) {
                            throw `Func of Application is not a function`;
                        }
                        return func.apply([], context, cont);
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
                return evaluate(ast.stmts[i], new_env, _cont, context);
            }
            else {
                return cont(val);
            }
        };
        return evaluate(ast.stmts[i], new_env, _cont, context);
    }
    else if (ast instanceof ast_1.Define) {
        return evaluate(ast.body, env, (body) => {
            env.define(ast.identifer, body);
            return cont(context.VOID_VALUE);
        }, context);
    }
    else if (ast instanceof ast_1.SetBang) {
        return evaluate(ast.body, env, (body) => {
            env.modify(ast.identifer, body);
            return cont(context.VOID_VALUE);
        }, context);
    }
    else if (ast instanceof ast_1.Lambda) {
        return cont(new value_1.FuncValue(env, ast.body, ast.parameters));
    }
    else if (ast instanceof ast_1.IfStmt) {
        return evaluate(ast.cond, env, (cond) => {
            if (cond.eq(true)) {
                return evaluate(ast.pass, env, cont, context);
            }
            else {
                return evaluate(ast.fail, env, cont, context);
            }
        }, context);
    }
    else if (ast instanceof ast_1.CondStmt) {
        let i = 0;
        const _cont = (value) => {
            if (value.eq(true)) {
                return evaluate(ast.cases[i][1], env, cont, context);
            }
            else if (i < ast.cases.length - 1) {
                i++;
                return evaluate(ast.cases[i][0], env, _cont, context);
            }
            else {
                return cont(context.VOID_VALUE);
            }
        };
        return evaluate(ast.cases[0][0], env, _cont, context);
    }
    else if (ast instanceof ast_1.Let) {
        if (ast.bindings.length === 0) {
            return evaluate(ast.body, env, cont, context);
        }
        let i = 0;
        const new_env = new environment_1.Environment(env);
        const cont_ = (value) => {
            new_env.define(ast.bindings[i][0], value);
            if (i < ast.bindings.length - 1) {
                i++;
                return evaluate(ast.bindings[i][1], ast.star ? new_env : env, cont_, context);
            }
            else {
                return evaluate(ast.body, new_env, cont, context);
            }
        };
        return evaluate(ast.bindings[i][1], new_env, cont_, context);
    }
    else if (ast instanceof ast_1.Letrec) {
        const new_env = new environment_1.Environment(env);
        for (let i = 0; i < ast.bindings.length; i++) {
            new_env.define(ast.bindings[i][0], new value_1.SimpValue(value_1.ValueType.VOID));
        }
        let i = 0;
        const _cont = (value => {
            new_env.modify(ast.bindings[i][0], value);
            if (i < ast.bindings.length - 1) {
                i++;
                return evaluate(ast.bindings[i][1], new_env, _cont, context);
            }
            else {
                return evaluate(ast.body, new_env, cont, context);
            }
        });
        return evaluate(ast.bindings[i][1], new_env, _cont, context);
    }
    else if (ast instanceof ast_1.Identifer) {
        cont(env.find(ast.name));
    }
    else if (ast instanceof ast_1.IntegerLiteral) {
        cont(new value_1.SimpValue(value_1.ValueType.INTEGER, ast.value));
    }
    else if (ast instanceof ast_1.BooleanLiteral) {
        cont(new value_1.SimpValue(value_1.ValueType.BOOLEAN, ast.value));
    }
    else if (ast instanceof ast_1.CharLiteral) {
        cont(new value_1.SimpValue(value_1.ValueType.CHARACTER, ast.value));
    }
    else if (ast instanceof ast_1.NilLiteral) {
        cont(context.NIL_VALUE);
    }
    else if (ast instanceof ast_1.PairLiteral) {
        evaluate(ast.car, env, (car) => {
            evaluate(ast.cdr, env, (cdr) => {
                cont(new value_1.PairValue(car, cdr));
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
function test_evaluate(code) {
    const context = new interact_1.TestInteractContext();
    const cont = (value) => { context.output(value.print()); }; // halt
    const env = new environment_1.Environment(null);
    try {
        evaluate(parse_1.parse(tokenize_1.tokenize(code)), env, cont, context);
        return context.result;
    }
    catch (xxx) {
        return xxx;
    }
}
exports.test_evaluate = test_evaluate;
//# sourceMappingURL=evaluate.js.map