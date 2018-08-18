import {CodePosition, Token, tokenize, TokenType} from "./tokenize";
import {
    Application,
    AST,
    Begin,
    BooleanLiteral,
    CharLiteral,
    CondStmt,
    Define,
    Identifer,
    IfStmt,
    IntegerLiteral,
    Lambda,
    Literal, NilLiteral
} from "./ast";
import {isKeyword, isPrimitive} from "./constants";
import * as assert from "assert";

export function parse(tokens: Token[]): AST {
    if (tokens.length === 0) { // no tokens
        return null;
    }

    let pos = 0; // mark the current position

    function empty(): boolean {
        return pos >= tokens.length;
    }

    function cur(): Token {
        if (pos < tokens.length) return tokens[pos];
        // return new Token(CodePosition.getNull(), CodePosition.getNull(), "", -1, "");
        return null;
    }

    function match(condition ?: string | TokenType): Token {
        if (pos >= tokens.length) {
            throw `No more tokens availble`;
        }
        if (condition === undefined
            || typeof condition === "string" && cur().content === condition
            || cur().token_type === condition) {
            pos++;
            return tokens[pos - 1];
        }
        throw `Expected token ${condition}, got ${cur().content} at ${cur().begin}`;
    }

    function shift(condition ?: string | TokenType): Token {
        let res = cur();
        match(condition);
        return res;
    }

    function parseDefine(begin: CodePosition): Define {
        match("define");
        const id = shift();
        if (id.token_type !== TokenType.IDENTIFIER) {
            throw `Expected token ID, got ${id.content} at ${id.begin.toString()}`;
        }
        const name = id.content;
        if (isPrimitive(name)) {
            throw `Should not redefine primitive ${name} at ${id.begin.toString()}`;
        }
        const body = parseAST();
        const end = match(")").end;
        return new Define(begin, end, name, body);
    }

    function parseLambda(begin: CodePosition): Lambda {
        match("lambda");
        // parsing parameter
        match("(");
        let parameters: string[] = [];
        while (!cur().is(")")) {
            assert(cur().token_type === TokenType.IDENTIFIER);
            parameters.push(shift().value as string);
        }
        match(")");

        // parsing body

        const body = parseAST();
        const end = match(")").end;
        return new Lambda(begin, end, parameters, body);
    }

    function parseSList(begin: CodePosition): Literal {
        // TODO
        return null;
    }

    function parseQuote(begin?: CodePosition): Literal {
        if (begin === undefined) { // begin with '
            begin = cur().begin;
            match("'");
        }
        let value: Literal = null;

        if (cur().is(")")) {
            throw `Unexpected ")" at ${cur().begin.toString()} when parsing quote expression`;
        }

        if (cur().is("(")) { // it is a list or a pair
            const newBegin = match("(").begin;
            if (cur().is(")")) { // it is a nil
                const end = match(")").end;
                value = new NilLiteral(begin, end)
            } else { // its is a pair
                value = parseSList(begin);
            }
        } else {
            const temp = parseAST();
            assert(temp instanceof Literal);
        }
        return value;
    }

    function parseAST(): AST {
        if (empty()) {
            throw `No more tokens when parsing AST`;
        }
        if (cur().is("(")) { // is a s-expression
            return parseSExpression();
        } else if (cur().is("'")) { // its is a quote
            return parseQuote();
        } else {
            switch (cur().token_type) {
                case TokenType.BOOLEAN_LITERAL:
                    return new BooleanLiteral(shift());
                case TokenType.CHAR_LITERAL:
                    return new CharLiteral(shift());
                case TokenType.IDENTIFIER:
                    return new Identifer(shift());
                case TokenType.INTEGER_LITERAL:
                    return new IntegerLiteral(shift());
                case TokenType.STRING_LITERAL:
                    // TODO : should not come here
                    throw `should not come here`;
            }
        }
    }

    function parseIf(begin: CodePosition): IfStmt {
        match("if");
        // parsing cond
        const cond = parseAST();
        const pass = parseAST();
        const fail = parseAST();
        const end = match(")").end;
        return new IfStmt(begin, end, cond, pass, fail);
    }

    function parseCond(begin: CodePosition): CondStmt {
        match("cond");
        let cases: [AST, AST][] = [];
        while (cur().is("(")) {
            match("(");
            const first = parseAST();
            const second = parseAST();
            match(")");
            cases.push([first, second]);
        }
        const end = match(")").end;
        return new CondStmt(begin, end, cases);
    }

    function parseBegin(begin: CodePosition): Begin {
        match("begin");
        let stmts: AST[] = [];
        while (!cur().is(")")) {
            stmts.push(parseAST());
        }
        const end = match(")").end;
        return new Begin(begin, end, stmts);
    }

    function parseSExpression(): AST {
        // matched "("
        const begin = shift("(").begin;
        const head = cur().content;
        let res: AST = null;
        if (isKeyword(head)) {
            switch (head) {
                case "define":
                    res = parseDefine(begin);
                    break;
                case "lambda":
                    res = parseLambda(begin);
                    break;
                case "if":
                    res = parseIf(begin);
                    break;
                case "cond":
                    res = parseCond(begin);
                    break;
                case "begin":
                    res = parseBegin(begin);
                    break;
                case "quote":
                    match("quote");
                    res = parseQuote(begin);
                    break;
                default:
                    throw `Unsupported keyword ${head}`;
            }
        } else { // function application
            const func = parseAST();
            let parameters: AST[] = [];
            while (cur() && !cur().is(")")) {
                parameters.push(parseAST());
            }
            const end = match(")").end;
            res = new Application(begin, end, func, parameters);
        }
        return res; // FIXME
    }

    let asts: AST[] = [];

    while (cur()) { // there still tokens
        asts.push(parseAST());
    }

    return asts.length <= 1 ?
            asts[0] :
            new Begin(tokens[0].begin, tokens[tokens.length - 1].end, asts);
}

// noinspection JSUnusedGlobalSymbols
export function flatPrint(code: string, filename?: string): string {
    return parse(tokenize(code, filename)).print();
}

