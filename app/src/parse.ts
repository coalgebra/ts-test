import {Token, TokenType} from "./tokenize";
import {AST, Define, Lambda} from "./ast";
import {isKeyword, isPrimitive} from "./constants";

export function parse(tokens: Token[]): AST {
    if (tokens.length === 0) { // no tokens
        // FIXME: this should never happen
        return null;
    }

    let pos = 0; // mark the current position

    function cur(): Token {
        if (pos < tokens.length) return tokens[pos];
        return null;
    }

    function match(condition ?: string | TokenType): void {
        if (pos >= tokens.length) return;
        if (condition === null
            || typeof condition === "string" && cur().content === condition
            || cur().token_type === condition) {
            pos++;
            return;
        }
        throw `Expected token ${condition}, got ${cur().content} at ${cur().begin}`;
    }

    function shift(condition ?: string | TokenType): Token {
        let res = cur();
        match(condition);
        return res;
    }

    function parseDefine(): Define {
        // "(" "define"
        const id = cur();
        if (id.token_type !== TokenType.IDENTIFIER) {
            throw `Expected token ID, got ${id.content} at ${id.begin.toString()}`;
        }
        const name = id.content;
        if (isPrimitive(name)) {
            throw `Should not redefine primitive ${name} at ${id.begin.toString()}`;
        }
        const body = parseAST();
        return null;
    }

    function parseLambda(): Lambda {
        // TODO
        return null;
    }

    function parseAST(): AST {
        // TODO
        return null;
    }

    function parseSExpression(): AST {
        // assert tokens[0] === "("
        const begin = tokens[pos].content;
        if (isKeyword(begin)) {
            switch (begin) {
                case "define":
                case "lambda":
                case "if":
                case "cond":
                case "begin":
                default:
            }
        }
        return null; // FIXME
    }

    // check the first token
    const begin = tokens[0];

    if (begin.is("(")) { // it starts a new s-expression
        return parseSExpression();
    }

    return null; // FIXME
}
