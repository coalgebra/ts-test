"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SAST_1 = require("./SAST");
const value_1 = require("./value");
const desugar_1 = require("./desugar");
const parse_1 = require("./parse");
const tokenize_1 = require("./tokenize");
class SimpEnv {
    constructor(parent) {
        this.parent = parent;
        this.mapping = new Map();
    }
    find(name) {
        let env = this;
        while (env !== null) {
            if (env.mapping.has(name)) {
                return env.mapping.get(name);
            }
            env = env.parent;
        }
        throw `Cannot find ${name} in current scope`;
    }
    define(name, value) {
        if (this.mapping.has(name)) {
            throw `duplicate definition for ${name}`;
        }
        this.mapping.set(name, value);
    }
    set(name, value) {
        let env = this;
        while (env !== null) {
            if (env.mapping.has(name)) {
                env.mapping.set(name, value);
                return;
            }
            env = env.parent;
        }
        throw `Cannot find ${name} in current scope`;
    }
}
function isTrivial(ast) {
    return ast instanceof SAST_1.SLiteral || ast instanceof SAST_1.SIdentifier;
}
function simplify(ast, env) {
    if (ast instanceof SAST_1.SDefine) {
        return new SAST_1.SDefine(ast.identifier, simplify(ast.body, env));
    }
    else if (ast instanceof SAST_1.SApply) {
        const func = simplify(ast.func, env);
        const params = ast.parameters.map(x => simplify(x, env));
        if (func instanceof SAST_1.SLambda) {
            if (params.length !== func.parameters.length) {
                throw `Function parameter number dismatch`;
            }
            if (isTrivial(func.body)) {
                const new_env = new SimpEnv(env);
                for (let i = 0; i < params.length; i++) {
                    new_env.define(func.parameters[i], params[i]);
                }
                return simplify(func.body, new_env);
            }
            let flag = true;
            params.forEach(x => {
                flag = flag && isTrivial(x);
            });
            if (flag) { // parameters are all trivial
                const new_env = new SimpEnv(env);
                for (let i = 0; i < params.length; i++) {
                    new_env.define(func.parameters[i], params[i]);
                }
                return simplify(func.body, new_env);
            }
        }
        return new SAST_1.SApply(func, params);
    }
    else if (ast instanceof SAST_1.SLambda) {
        const new_env = new SimpEnv(env);
        ast.parameters.map(name => {
            new_env.define(name, new SAST_1.SIdentifier(name));
        });
        return new SAST_1.SLambda(ast.parameters, simplify(ast.body, new_env));
    }
    else if (ast instanceof SAST_1.SSetbang) {
        return new SAST_1.SSetbang(ast.identifier, simplify(ast.body, env));
    }
    else if (ast instanceof SAST_1.SDefine) {
        return new SAST_1.SDefine(ast.identifier, simplify(ast.body, env));
    }
    else if (ast instanceof SAST_1.SIf) {
        const cond = simplify(ast.cond, env);
        if (cond instanceof SAST_1.SLiteral) {
            if (cond.value.is(value_1.ValueType.BOOLEAN)) {
                if (cond.value.eq(true)) {
                    return simplify(ast.pass, env);
                }
                else if (cond.value.eq(false)) {
                    return simplify(ast.fail, env);
                }
            }
        }
        return new SAST_1.SIf(simplify(ast.cond, env), simplify(ast.pass, env), simplify(ast.fail, env));
    }
    else if (ast instanceof SAST_1.SIdentifier) {
        try {
            return env.find(ast.name);
        }
        catch (_) {
            return ast;
        }
    }
    else if (ast instanceof SAST_1.SBegin) {
        const new_env = new SimpEnv(env);
        return new SAST_1.SBegin(ast.stmts.map(x => simplify(x, new_env)));
    }
    else if (ast instanceof SAST_1.SLiteral) {
        return ast;
    }
    throw `Unexpected sast type at simplify()`;
}
function simplify_test(code) {
    try {
        const new_env = new SimpEnv(null);
        return simplify(desugar_1.desugar(parse_1.parse(tokenize_1.tokenize(code))), new_env).print();
    }
    catch (e) {
        return e.toString();
    }
}
exports.simplify_test = simplify_test;
//# sourceMappingURL=simplify.js.map