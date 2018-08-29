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
    NilLiteral,
    PairLiteral,
    SetBang
} from "./ast";
import {Environment} from "./environment";
import {Continuation, FuncValue, PairValue, SimpValue, Value, ValueType} from "./utils";
import {getPrimitives, isPrimitive} from "./constants";
import {InteractContext} from "./interact";

// cps-style interpreter
export function evaluate(ast: AST, env: Environment, cont: (value: Value) => any, context: InteractContext) {
    if (ast instanceof Application) {
        if (ast.func instanceof Identifer && isPrimitive(ast.func.name)){
            // call with current continuation
            if (ast.func.name === "call/cc") {
                if (ast.parameter.length !== 1) throw `call/cc only need one parameter`;
                evaluate(ast.parameter[0], env, (fun: Value) => {
                    if (fun instanceof FuncValue) {
                        fun.evaluate([new Continuation(cont)], context, cont);
                    } else if (fun instanceof Continuation) {
                        fun.cont(new Continuation(cont));
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
                        evaluate(ast.parameter[i], env, _cont, context);
                    } else {
                        cont(fun(parameters));
                    }
                };
                if (ast.parameter.length > 0) {
                    evaluate(ast.parameter[0], env, _cont, context);
                } else {
                    cont(fun(parameters));
                }
            }
        } else {
            evaluate(ast.func, env, (func: Value) => {
                let parameters: Value[] = [];
                let i = 0;
                const _cont = (val) => {
                    parameters.push(val);
                    if (i < ast.parameter.length - 1) {
                        i++;
                        evaluate(ast.parameter[i], env, _cont, context);
                    } else {
                        if (func instanceof Continuation) {
                            if (parameters.length !== 1) {
                                throw `Parameter numbers for continuation must be one`;
                            }
                            func.cont(parameters[0]);
                        } else {
                            if (func.type !== ValueType.FUNCTION) {
                                throw `Func of Application is not a function`;
                            }
                            (func as FuncValue).evaluate(parameters, context, cont);
                        }
                    }
                };
                if (ast.parameter.length > 0) {
                    evaluate(ast.parameter[0], env, _cont, context);
                } else {
                    if (func instanceof Continuation) {
                        if (parameters.length !== 1) {
                            throw `Parameter numbers for continuation must be one`;
                        }
                        func.cont(parameters[0]);
                    } else {
                        if (func.type !== ValueType.FUNCTION) {
                            throw `Func of Application is not a function`;
                        }
                        (func as FuncValue).evaluate([], context, cont);
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
                evaluate(ast.stmts[i], new_env, _cont, context);
            } else {
                cont(val);
            }
        };
        evaluate(ast.stmts[i], new_env, _cont, context);
    } else if (ast instanceof Define) {
        evaluate(ast.body, env, (body) => {
            env.define(ast.identifer, body);
            cont(context.VOID_VALUE);
        }, context);
    } else if (ast instanceof SetBang) {
        evaluate(ast.body, env, (body) => {
            env.modify(ast.identifer, body);
            cont(context.VOID_VALUE);
        }, context);
    } else if (ast instanceof Lambda) {
        cont(new FuncValue(env, ast.body, ast.parameters));
    } else if (ast instanceof IfStmt) {
        evaluate(ast.cond, env, (cond) => {
            if (cond.eq(true)) {
                evaluate(ast.pass, env, cont, context);
            } else {
                evaluate(ast.fail, env, cont, context);
            }
        }, context);
    } else if (ast instanceof CondStmt) {
        let i = 0;
        const _cont = (value: Value) => {
            if (value.eq(true)) {
                evaluate(ast.cases[i][1], env, cont, context);
            } else if (i < ast.cases.length - 1) {
                i++;
                evaluate(ast.cases[i][0], env, _cont, context);
            } else {
                cont(context.VOID_VALUE);
            }
        };
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
