"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const SAST_1 = require("./SAST");
const value_1 = require("./value");
const parse_1 = require("./parse");
const tokenize_1 = require("./tokenize");
function desugar(ast) {
    if (ast instanceof ast_1.Define) {
        return new SAST_1.SDefine(ast.identifer, desugar(ast.body));
    }
    else if (ast instanceof ast_1.Lambda) {
        return new SAST_1.SLambda(ast.parameters, desugar(ast.body));
    }
    else if (ast instanceof ast_1.Begin) {
        return new SAST_1.SBegin(ast.stmts.map(x => desugar(x)));
    }
    else if (ast instanceof ast_1.Application) {
        return new SAST_1.SApply(desugar(ast.func), ast.parameter.map(x => desugar(x)));
    }
    else if (ast instanceof ast_1.Let) {
        if (ast.star) { // let*
            let core = desugar(ast.body);
            for (let i = ast.bindings.length - 1; i >= 0; i--) {
                core = new SAST_1.SApply(new SAST_1.SLambda([ast.bindings[i][0]], core), [desugar(ast.bindings[i][1])]);
            }
            return core;
        }
        else {
            return new SAST_1.SApply(new SAST_1.SLambda(ast.bindings.map(x => x[0]), desugar(ast.body)), ast.bindings.map(x => desugar(x[1])));
        }
    }
    else if (ast instanceof ast_1.SetBang) {
        return new SAST_1.SSetbang(ast.identifer, desugar(ast.body));
    }
    else if (ast instanceof ast_1.IfStmt) {
        return new SAST_1.SIf(desugar(ast.cond), desugar(ast.pass), desugar(ast.fail));
    }
    else if (ast instanceof ast_1.CondStmt) {
        let core = new SAST_1.SIf(desugar(ast.cases[ast.cases.length - 1][0]), desugar(ast.cases[ast.cases.length - 1][1]), new SAST_1.SLiteral(new value_1.SimpValue(value_1.ValueType.VOID)));
        if (ast.cases[ast.cases.length - 1][0].print() === "#t") {
            core = desugar(ast.cases[ast.cases.length - 1][1]);
        }
        for (let i = ast.cases.length - 2; i >= 0; i--) {
            core = new SAST_1.SIf(desugar(ast.cases[i][0]), desugar(ast.cases[i][1]), core);
        }
        return core;
    }
    else if (ast instanceof ast_1.Identifer) {
        return new SAST_1.SIdentifier(ast.name);
    }
    else if (ast instanceof ast_1.BooleanLiteral) {
        return new SAST_1.SLiteral(new value_1.SimpValue(value_1.ValueType.BOOLEAN, ast.value));
    }
    else if (ast instanceof ast_1.IntegerLiteral) {
        return new SAST_1.SLiteral(new value_1.SimpValue(value_1.ValueType.INTEGER, ast.value));
    }
    else if (ast instanceof ast_1.CharLiteral) {
        return new SAST_1.SLiteral(new value_1.SimpValue(value_1.ValueType.CHARACTER, ast.value));
    }
    else if (ast instanceof ast_1.NilLiteral) {
        return new SAST_1.SLiteral(new value_1.SimpValue(value_1.ValueType.NIL, "()"));
    }
    else if (ast instanceof ast_1.PairLiteral) {
        return new SAST_1.SLiteral(new value_1.PairValue(desugar(ast.car).value, desugar(ast.cdr).value));
    }
    throw `Unexpected AST ${ast.print()}`;
}
exports.desugar = desugar;
function desugar_test(code) {
    try {
        return desugar(parse_1.parse(tokenize_1.tokenize(code))).print();
    }
    catch (xxx) {
        return xxx;
    }
}
exports.desugar_test = desugar_test;
//# sourceMappingURL=desugar.js.map