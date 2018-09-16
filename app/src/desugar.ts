import {
    Application,
    AST,
    Begin,
    BooleanLiteral,
    CharLiteral,
    CondStmt,
    Define, Identifer,
    IfStmt,
    IntegerLiteral,
    Lambda,
    Let,
    NilLiteral,
    PairLiteral,
    SetBang
} from "./ast";
import {SApply, SAST, SBegin, SDefine, SIdentifier, SIf, SLambda, SLiteral, SSetbang} from "./SAST";
import {PairValue, SimpValue, ValueType} from "./value";
import {parse} from "./parse";
import {tokenize} from "./tokenize";

export function desugar(ast: AST): SAST {
    if (ast instanceof Define) {
        return new SDefine(ast.identifer, desugar(ast.body));
    } else if (ast instanceof Lambda) {
        return new SLambda(ast.parameters, desugar(ast.body));
    } else if (ast instanceof Begin) {
        return new SBegin(ast.stmts.map(x => desugar(x)));
    } else if (ast instanceof Application) {
        return new SApply(desugar(ast.func), ast.parameter.map(x => desugar(x)));
    } else if (ast instanceof Let) {
        if (ast.star) { // let*
            let core = desugar(ast.body);
            for (let i = ast.bindings.length - 1; i >= 0; i--) {
                core = new SApply(new SLambda([ast.bindings[i][0]], core), [desugar(ast.bindings[i][1])]);
            }
            return core;
        } else {
            return new SApply(
                new SLambda(ast.bindings.map(x => x[0]),
                    desugar(ast.body)),
                ast.bindings.map(x => desugar(x[1]))
            );
        }
    } else if (ast instanceof SetBang) {
        return new SSetbang(ast.identifer, desugar(ast.body));
    } else if (ast instanceof IfStmt) {
        return new SIf(desugar(ast.cond), desugar(ast.pass), desugar(ast.fail));
    } else if (ast instanceof CondStmt) {
        let core : SAST = new SIf(desugar(ast.cases[ast.cases.length - 1][0]),
            desugar(ast.cases[ast.cases.length - 1][1]),
            new SLiteral(new SimpValue(ValueType.VOID)));
        if (ast.cases[ast.cases.length - 1][0].print() === "#t") {
            core = desugar(ast.cases[ast.cases.length - 1][1]);
        }
        for (let i = ast.cases.length - 2; i >= 0; i--) {
            core = new SIf(desugar(ast.cases[i][0]),
                desugar(ast.cases[i][1]),
                core);
        }
        return core;
    } else if (ast instanceof Identifer) {
        return new SIdentifier(ast.name);
    } else if (ast instanceof BooleanLiteral) {
        return new SLiteral(new SimpValue(ValueType.BOOLEAN, ast.value));
    } else if (ast instanceof IntegerLiteral) {
        return new SLiteral(new SimpValue(ValueType.INTEGER, ast.value));
    } else if (ast instanceof CharLiteral) {
        return new SLiteral(new SimpValue(ValueType.CHARACTER, ast.value));
    } else if (ast instanceof NilLiteral) {
        return new SLiteral(new SimpValue(ValueType.NIL, "()"));
    } else if (ast instanceof PairLiteral) {
        return new SLiteral(new PairValue(
            (desugar(ast.car) as SLiteral).value,
            (desugar(ast.cdr) as SLiteral).value));
    }
    throw `Unexpected AST ${ast.print()}`;
}

export function desugar_test(code: string): string {
    try {
        return desugar(parse(tokenize(code))).print();
    } catch (xxx) {
        return xxx;
    }
}
