"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Environment {
    constructor(parent = null) {
        this.parent = parent;
        this.bindings = new Map();
    }
    findInCur(name) {
        if (this.bindings.has(name))
            return this.bindings.get(name);
        return null;
    }
    find(name) {
        let cur = this;
        let res;
        res = cur.findInCur(name);
        while (cur && !res) {
            cur = cur.parent;
            res = cur ? cur.findInCur(name) : null;
        }
        return res;
    }
    modify(name, value) {
        let cur = this;
        while (cur) {
            if (cur.bindings.has(name)) {
                cur.bindings.set(name, value);
                return;
            }
            cur = cur.parent;
        }
        throw `Can not find ${name} in current scope`;
    }
    define(name, value) {
        if (this.bindings.has(name)) {
            throw `Redefined identifier ${name}`;
        }
        this.bindings.set(name, value);
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map