import {SAST} from "./SAST";

export class CpsContext {
    counter: number;
    constructor() {
        this.counter = 0;
    }
    genSymbol(prefix: string, suffix: string = ""): string {
        return `${prefix}$${this.counter++}${suffix}`;
    }
}

export function cps_transform(ast: SAST): SAST {

    return null;
}
