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
    Let, Letrec,
    NilLiteral,
    PairLiteral,
    SetBang
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
        if (id.is("(")) {
            // (define (id x) x) syntax sugar
            const lambda_begin = cur().begin;
            const new_id = shift(TokenType.IDENTIFIER).content;
            const parameters: string[] = [];
            while (!cur().is(")")) {
                parameters.push(shift(TokenType.IDENTIFIER).content);
            }
            match(")");
            const body = parseAST();
            const end = match(")").end;
            return new Define(begin, end, new_id, new Lambda(lambda_begin, end, parameters, body))
        }
        if (id.token_type !== TokenType.IDENTIFIER) {
            throw `Expected token ID, got ${id.content} at ${id.begin.toString()}`;
        }
        const name = id.content;
        if (isPrimitive(name) || isKeyword(name)) {
            throw `Should not redefine primitive ${name} at ${id.begin.toString()}`;
        }
        const body = parseAST();
        const end = match(")").end;
        return new Define(begin, end, name, body);
    }

    function parseSetBang(begin: CodePosition): SetBang {
        match("set!");
        const id = shift();
        if (id.token_type !== TokenType.IDENTIFIER) {
            throw `Expected token ID, got ${id.content} at ${id.begin.toString()}`;
        }
        const name = id.content;
        if (isPrimitive(name) || isKeyword(name)) {
            throw `Should not redefine primitive ${name} at ${id.begin.toString()}`;
        }
        const body = parseAST();
        const end = match(")").end;
        return new SetBang(begin, end, name, body);
    }

    function parseLetrec(begin: CodePosition): Letrec {
        match(`letrec`);
        match("(");
        const bindings : [string, AST][] = [];
        while (cur().is("(")) {
            match("(");
            const name = match(TokenType.IDENTIFIER);
            const binding = parseAST();
            match(")");
            bindings.push([name.content, binding]);
        }
        match(")");
        const body = parseAST();
        const end = match(")").end;
        return new Letrec(begin, end, bindings, body);
    }

    function parseLet(begin: CodePosition, star: boolean = false): Let {
        match(`let${star ? "*" : ""}`);
        match("(");
        const bindings : [string, AST][] = [];
        while (cur().is("(")) {
            match("(");
            const name = match(TokenType.IDENTIFIER);
            const binding = parseAST();
            match(")");
            bindings.push([name.content, binding]);
        }
        match(")");
        const body = parseAST();
        const end = match(")").end;
        return new Let(begin, end, bindings, body, star);
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
        if (cur().is(")")) {
            const end = match(")").end;
            return new Lambda(begin, end, parameters, body);
        }
        const block: AST[] = [body];
        while (!cur().is(")")) {
            block.push(parseAST());
        }
        const end = match(")").end;
        return new Lambda(begin, end, parameters, new Begin(block[0].begin, end, block));
    }

    function parseSList(begin: CodePosition): AST {
        // matched "("
        let values: AST[] = [];
        let list: boolean = true;
        while (!cur().is(")")) {
            if (cur().trivial()) {
                values.push(parseSimpleToken());
            } else if (cur().is("(")) {
                const begin_ = match("(").begin;
                values.push(parseSList(begin_));
            } else if (cur().is(".")) { //
                match(".");
                values.push(parseQuote(cur().begin));
                match(")");
                list = false;
                break;
            } else {
                throw `Unexpected token ${cur().content} at ${cur().begin} when parsing s-list`;
            }
        }
        if (list) {
            const pos = match(")").begin;
            values.push(new NilLiteral(pos, pos));
        }
        let acc: AST = null;
        for (let i = values.length - 1; i >= 0; i--) {
            if (!acc) acc = values[i];
            else {
                acc = new PairLiteral(values[i], acc);
            }
        }
        return acc;
    }

    function parseQuote(begin?: CodePosition): AST {
        if (begin === undefined) { // begin with '
            begin = cur().begin;
            match("'");
        }
        let value: AST = null;

        if (cur().is(")")) {
            throw `Unexpected ")" at ${cur().begin.toString()} when parsing quote expression`;
        }

        if (cur().is("(")) { // it is a list or a pair
            match("(");
            value = parseSList(begin);
        } else if (cur().trivial()) {
            value = parseSimpleToken();
        }
        return value;
    }

    function parseSimpleToken(): AST {
        switch (cur().token_type) {
            case TokenType.BOOLEAN_LITERAL:
                return new BooleanLiteral(shift());
            case TokenType.CHAR_LITERAL:
                return new CharLiteral(shift());
            case TokenType.IDENTIFIER:
                return new Identifer(shift());
            case TokenType.INTEGER_LITERAL:
                return new IntegerLiteral(shift());
            default:
                throw `Expected simple token, got ${cur().content} at ${cur().begin.toString()}`;
        }
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
            return parseSimpleToken();
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
                case "set!":
                    res = parseSetBang(begin);
                    break;
                case "let":
                    res = parseLet(begin);
                    break;
                case "let*":
                    res = parseLet(begin, true);
                    break;
                case "letrec":
                    res = parseLetrec(begin);
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

