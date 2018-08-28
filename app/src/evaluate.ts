import {
    Application,
    AST,
    BooleanLiteral,
    CharLiteral,
    CondStmt,
    Define,
    SetBang,
    Identifer,
    IfStmt,
    IntegerLiteral,
    Lambda,
    NilLiteral, PairLiteral, Begin
} from "./ast";
import {Environment} from "./environment";
import {FuncValue, PairValue, SimpValue, Value, ValueType, VOID_VALUE} from "./utils";
import {isPrimitive} from "./constants";

// cps-style interpreter
export function evaluate(ast: AST, env: Environment, cont: (value: Value) => any) {
    if (ast instanceof Application) {
        if (ast.func instanceof Identifer && isPrimitive(ast.func.name)) {
            // no need for cps to primitives
            // TODO
        } else {
            evaluate(ast.func, env, (func: Value) => {
                let parameters: Value[] = [];
                for (let i = 0; i < ast.parameter.length; i++) {
                    evaluate(ast.parameter[i], env, (value) => {
                        parameters.push(value);
                    });
                }
                if (func.type !== ValueType.FUNCTION) {
                    throw `Func of Application is not a function`;
                }
                cont((func as FuncValue).evaluate(parameters));
            });
        }
    } else if (ast instanceof Begin) {
        for (let i = 0; i < ast.stmts.length - 1; i++) {
            evaluate(ast.stmts[i], env, (_) => {
                // DO NOTHING
            });
        }
        evaluate(ast.stmts[ast.stmts.length - 1], env, (res) => {
            cont(res);
        });
    } else if (ast instanceof Define) {
        evaluate(ast.body, env, (body) => {
            env.define(ast.identifer, body);
            cont(VOID_VALUE);
        });
    } else if (ast instanceof SetBang) {
        evaluate(ast.body, env, (body) => {
            env.modify(ast.identifer, body);
            cont(VOID_VALUE);
        });
    } else if (ast instanceof Lambda) {
        cont(new FuncValue(env, ast.body, ast.parameters));
    } else if (ast instanceof IfStmt) {
        evaluate(ast.cond, env, (cond) => {
            if (cond.is(true)) {
                evaluate(ast.pass, env, cont);
            } else {
                evaluate(ast.fail, env, cont);
            }
        });
    } else if (ast instanceof CondStmt) {
        let flag: boolean = false;
        for (let i = 0; i < ast.cases.length && !flag; i++) {
            evaluate(ast.cases[i][0], env, (res) => {
                if (res.is(true)) {
                    evaluate(ast.cases[i][1], env, cont);
                    flag = true;
                }
            });
        }
        if (!flag) {
            cont(VOID_VALUE);
        }
    } else if (ast instanceof Identifer) {
        cont(env.find(ast.name));
    } else if (ast instanceof IntegerLiteral) {
        cont(new SimpValue(ValueType.INTEGER, ast.value));
    } else if (ast instanceof BooleanLiteral) {
        cont(new SimpValue(ValueType.BOOLEAN, ast.value));
    } else if (ast instanceof CharLiteral) {
        cont(new SimpValue(ValueType.CHARACTER, ast.value));
    } else if (ast instanceof NilLiteral) {
        cont(new SimpValue(ValueType.NIL, "()"));
    } else if (ast instanceof PairLiteral) {
        evaluate(ast.car, env, (car) => {
            evaluate(ast.cdr, env, (cdr) => {
                cont(new PairValue(car, cdr));
            })
        });
    } else {
        throw `Unrecognized ast ${ast.print()} when evaluating`;
    }
}

export function repl() {

}
