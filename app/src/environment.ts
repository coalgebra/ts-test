import {ValueType} from "./value";
import {Value} from "./value";

export class Environment {
    bindings: Map<string, Value>;
    parent: Environment;

    constructor(parent: Environment = null) {
        this.parent = parent;
        this.bindings = new Map<string, Value>();
    }
    findInCur(name: string): Value {
        if (this.bindings.has(name)) return this.bindings.get(name);
        return null;
    }
    find(name: string): Value {
        let cur: Environment = this;
        let res: Value;
        res = cur.findInCur(name);
        while (cur && !res) {
            cur = cur.parent;
            res = cur ? cur.findInCur(name) : null;
        }
        if (!res) {
            throw `Can not find identifier ${name}`;
        }
        return res;
    }
    modify(name: string, value: Value) {
        let cur: Environment = this;
        while (cur) {
            if (cur.bindings.has(name)) {
                cur.bindings.set(name, value);
                return;
            }
            cur = cur.parent;
        }
        throw `Can not find ${name} in current scope`;
    }

    define(name: string, value: Value) {
        if (this.bindings.has(name)) {
            throw `Redefined identifier ${name}`;
        }
        this.bindings.set(name, value);
    }
}
