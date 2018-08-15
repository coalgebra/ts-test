import {Context} from "./utils";

export interface AST {
    slist: AST[];

    codegen(context: Context): void;

}
