import {
    Application,
    AST,
    Begin,
    BooleanLiteral,
    CharLiteral,
    CondStmt,
    Define,
    Identifer,
    IfStmt,
    IntegerLiteral,
    Lambda,
    Let,
    Letrec,
    NilLiteral,
    PairLiteral,
    SetBang
} from "./ast";
import {Environment} from "./environment";
import {Continuation, FuncValue, PairValue, SimpValue, Value, ValueType} from "./value";
import {getPrimitives, isPrimitive} from "./constants";
import {InteractContext, TestInteractContext} from "./interact";
import {parse} from "./parse";
import {tokenize} from "./tokenize";

// cps-style interpreter
export function evaluate(ast: AST, env: Environment, cont: (value: Value) => any, context: InteractContext) {
    if (ast instanceof Application) {
        if (ast.func instanceof Identifer && isPrimitive(ast.func.name)){
            // call with current continuation
            if (ast.func.name === "call/cc") {
                if (ast.parameter.length !== 1) throw `call/cc only need one parameter`;
                return evaluate(ast.parameter[0], env, (fun: Value) => {
                    if (fun instanceof FuncValue) {
                        return fun.apply([new Continuation(cont)], context, cont);
                    } else if (fun instanceof Continuation) {
                        return fun.cont(new Continuation(cont));
                    } else {
                        throw `Parameter of call/cc must be a function`;
                    }
                }, context);
            } else {
                const fun = getPrimitives(ast.func.name, context);
                let i = 0;
                let parameters: Value[] = [];
                const _cont = (val) => {
                    parameters.push(val);
                    if (i < ast.parameter.length - 1) {
                        i++;
                        return evaluate(ast.parameter[i], env, _cont, context);
                    } else {
                        return cont(fun(parameters));
                    }
                };
                if (ast.parameter.length > 0) {
                    return evaluate(ast.parameter[0], env, _cont, context);
                } else {
                    return cont(fun(parameters));
                }
            }
        } else {
            return evaluate(ast.func, env, (func: Value) => {
                let parameters: Value[] = [];
                let i = 0;
                const _cont = (val) => {
                    parameters.push(val);
                    if (i < ast.parameter.length - 1) {
                        i++;
                        return evaluate(ast.parameter[i], env, _cont, context);
                    } else {
                        if (func instanceof Continuation) {
                            if (parameters.length !== 1) {
                                throw `Parameter numbers for continuation must be one`;
                            }
                            return func.cont(parameters[0]);
                        } else {
                            if (func.type !== ValueType.FUNCTION) {
                                throw `Func of Application is not a function`;
                            }
                            return (func as FuncValue).apply(parameters, context, cont);
                        }
                    }
                };
                if (ast.parameter.length > 0) {
                    return evaluate(ast.parameter[0], env, _cont, context);
                } else {
                    if (func instanceof Continuation) {
                        if (parameters.length !== 1) {
                            throw `Parameter numbers for continuation must be one`;
                        }
                        return func.cont(parameters[0]);
                    } else {
                        if (func.type !== ValueType.FUNCTION) {
                            throw `Func of Application is not a function`;
                        }
                        return (func as FuncValue).apply([], context, cont);
                    }
                }
            }, context);
        }
    } else if (ast instanceof Begin) {
        const new_env = new Environment(env);
        let i = 0;
        const _cont = (val) => {
            if (i < ast.stmts.length - 1) {
                i++;
                return evaluate(ast.stmts[i], new_env, _cont, context);
            } else {
                return cont(val);
            }
        };
        return evaluate(ast.stmts[i], new_env, _cont, context);
    } else if (ast instanceof Define) {
        return evaluate(ast.body, env, (body) => {
            env.define(ast.identifer, body);
            return cont(context.VOID_VALUE);
        }, context);
    } else if (ast instanceof SetBang) {
        return evaluate(ast.body, env, (body) => {
            env.modify(ast.identifer, body);
            return cont(context.VOID_VALUE);
        }, context);
    } else if (ast instanceof Lambda) {
        return cont(new FuncValue(env, ast.body, ast.parameters));
    } else if (ast instanceof IfStmt) {
        return evaluate(ast.cond, env, (cond) => {
            if (cond.eq(true)) {
                return evaluate(ast.pass, env, cont, context);
            } else {
                return evaluate(ast.fail, env, cont, context);
            }
        }, context);
    } else if (ast instanceof CondStmt) {
        let i = 0;
        const _cont = (value: Value) => {
            if (value.eq(true)) {
                return evaluate(ast.cases[i][1], env, cont, context);
            } else if (i < ast.cases.length - 1) {
                i++;
                return evaluate(ast.cases[i][0], env, _cont, context);
            } else {
                return cont(context.VOID_VALUE);
            }
        };
        return evaluate(ast.cases[0][0], env, _cont, context);
    } else if (ast instanceof Let) {
        if (ast.bindings.length === 0) {
            return evaluate(ast.body, env, cont, context);
        }
        let i = 0;
        const new_env = new Environment(env);
        const cont_ = (value: Value) => {
            new_env.define(ast.bindings[i][0], value);
            if (i < ast.bindings.length - 1) {
                i++;
                return evaluate(ast.bindings[i][1], ast.star ? new_env : env, cont_, context);
            } else {
                return evaluate(ast.body, new_env, cont, context);
            }
        };
        return evaluate(ast.bindings[i][1], new_env, cont_, context);
    } else if (ast instanceof Letrec) {
        const new_env = new Environment(env);
        for (let i = 0; i < ast.bindings.length; i++) {
            new_env.define(ast.bindings[i][0], new SimpValue(ValueType.VOID));
        }
        let i = 0;
        const _cont = (value => {
            new_env.modify(ast.bindings[i][0], value);
            if (i < ast.bindings.length - 1){
                i++;
                return evaluate(ast.bindings[i][1], new_env, _cont, context);
            } else {
                return evaluate(ast.body, new_env, cont, context);
            }
        });
        return evaluate(ast.bindings[i][1], new_env, _cont, context);
    } else if (ast instanceof Identifer) {
        cont(env.find(ast.name));
    } else if (ast instanceof IntegerLiteral) {
        cont(new SimpValue(ValueType.INTEGER, ast.value));
    } else if (ast instanceof BooleanLiteral) {
        cont(new SimpValue(ValueType.BOOLEAN, ast.value));
    } else if (ast instanceof CharLiteral) {
        cont(new SimpValue(ValueType.CHARACTER, ast.value));
    } else if (ast instanceof NilLiteral) {
        cont(context.NIL_VALUE);
    } else if (ast instanceof PairLiteral) {
        evaluate(ast.car, env, (car) => {
            evaluate(ast.cdr, env, (cdr) => {
                cont(new PairValue(car, cdr));
            }, context)
        }, context);
    } else {
        throw `Unrecognized ast ${ast.print()} when evaluating`;
    }
}

export function repl() {

}

export function test_evaluate(code: string): string {
    const context = new TestInteractContext();
    const cont = (value: Value) => { context.output(value.print()); }; // halt
    const env = new Environment(null);
    try {
        evaluate(parse(tokenize(code)), env, cont, context);
        return context.result;
    } catch (xxx) {
        return xxx;
    }
}
