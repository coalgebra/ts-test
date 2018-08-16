export class Context {
    // TODO
}

export enum ValueType {
    FUNCTION,
    BOOLEAN,
    INTEGER,
    CHARACTER, // TODO
    PAIR,
    NIL, // ()
}

export class CommandLineArguments {
    cps_flag: boolean;
    curry_flag: boolean;
    fold_flag: boolean;
    output_file: string;
    // TODO
}
