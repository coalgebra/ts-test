import {SimpValue, ValueType} from "./utils";

export interface InteractContext {
    VOID_VALUE: SimpValue;
    NIL_VALUE: SimpValue;

    readline(): string;

    output(content: string);
}

export class DefaultInteractContext implements InteractContext {
    NIL_VALUE: SimpValue;
    VOID_VALUE: SimpValue;

    constructor() {
        this.VOID_VALUE = new SimpValue(ValueType.VOID);
        this.NIL_VALUE = new SimpValue(ValueType.NIL, "()");
    }

    output(content: string) {
        console.log(content);
    }

    readline(): string {
        return "";
    }

}
