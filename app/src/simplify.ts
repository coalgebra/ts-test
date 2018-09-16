import {SApply, SAST, SBegin, SDefine, SIdentifier, SIf, SLambda, SLiteral, SSetbang} from "./SAST";
import {ValueType} from "./value";
import {desugar} from "./desugar";
import {parse} from "./parse";
import {tokenize} from "./tokenize";

class SimpEnv {
    mapping: Map<string, SAST>;
    parent: SimpEnv;
    constructor(parent: SimpEnv) {
        this.parent = parent;
        this.mapping = new Map<string, SAST>();
    }
    find(name: string): SAST {
        let env: SimpEnv = this;
        while (env !== null) {
            if (env.mapping.has(name)) {
                return env.mapping.get(name);
            }
            env = env.parent;
        }
        throw `Cannot find ${name} in current scope`;
    }
    define(name: string, value: SAST) {
        if (this.mapping.has(name)) {
            throw `duplicate definition for ${name}`;
        }
        this.mapping.set(name, value);
    }
    set(name: string, value: SAST) {
        let env: SimpEnv = this;
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

function isTrivial(ast: SAST) : boolean {
    return ast instanceof SLiteral || ast instanceof SIdentifier;
}

function simplify(ast: SAST, env: SimpEnv) : SAST {
    if (ast instanceof SDefine) {
        return new SDefine(ast.identifier, simplify(ast.body, env));
    } else if (ast instanceof SApply) {
        const func = simplify(ast.func, env);
        const params = ast.parameters.map(x => simplify(x, env));
        if (func instanceof SLambda) {
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
            let flag: boolean = true;
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
        return new SApply(func, params);
    } else if (ast instanceof SLambda) {
        const new_env = new SimpEnv(env);
        ast.parameters.map(name => {
            new_env.define(name, new SIdentifier(name))
        });
        return new SLambda(ast.parameters, simplify(ast.body, new_env));
    } else if (ast instanceof SSetbang) {
        return new SSetbang(ast.identifier, simplify(ast.body, env));
    } else if (ast instanceof SDefine) {
        return new SDefine(ast.identifier, simplify(ast.body, env));
    } else if (ast instanceof SIf) {
        const cond = simplify(ast.cond, env);
        if (cond instanceof SLiteral) {
            if (cond.value.is(ValueType.BOOLEAN)) {
                if (cond.value.eq(true)) {
                    return simplify(ast.pass, env);
                } else if (cond.value.eq(false)) {
                    return simplify(ast.fail, env);
                }
            }
        }
        return new SIf(simplify(ast.cond, env), simplify(ast.pass, env), simplify(ast.fail, env));
    } else if (ast instanceof SIdentifier) {
        try {
            return env.find(ast.name);
        } catch (_) {
            return ast;
        }
    } else if (ast instanceof SBegin) {
        const new_env = new SimpEnv(env);
        return new SBegin(ast.stmts.map(x => simplify(x, new_env)));
    } else if (ast instanceof SLiteral) {
        return ast;
    }
    throw `Unexpected sast type at simplify()`;
}

export function simplify_test(code: string): string{
    try {
        const new_env = new SimpEnv(null);
        return simplify(desugar(parse(tokenize(code))), new_env).print();
    } catch (e) {
        return e.toString();
    }
}
