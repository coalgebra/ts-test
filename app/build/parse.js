"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenize_1 = require("./tokenize");
const ast_1 = require("./ast");
const constants_1 = require("./constants");
const assert = require("assert");
function parse(tokens) {
    if (tokens.length === 0) { // no tokens
        return null;
    }
    let pos = 0; // mark the current position
    function empty() {
        return pos >= tokens.length;
    }
    function cur() {
        if (pos < tokens.length)
            return tokens[pos];
        // return new Token(CodePosition.getNull(), CodePosition.getNull(), "", -1, "");
        return null;
    }
    function match(condition) {
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
    function shift(condition) {
        let res = cur();
        match(condition);
        return res;
    }
    function parseDefine(begin) {
        match("define");
        const id = shift();
        if (id.token_type !== tokenize_1.TokenType.IDENTIFIER) {
            throw `Expected token ID, got ${id.content} at ${id.begin.toString()}`;
        }
        const name = id.content;
        if (constants_1.isPrimitive(name)) {
            throw `Should not redefine primitive ${name} at ${id.begin.toString()}`;
        }
        const body = parseAST();
        const end = match(")").end;
        return new ast_1.Define(begin, end, name, body);
    }
    function parseLambda(begin) {
        match("lambda");
        // parsing parameter
        match("(");
        let parameters = [];
        while (!cur().is(")")) {
            assert(cur().token_type === tokenize_1.TokenType.IDENTIFIER);
            parameters.push(shift().value);
        }
        match(")");
        // parsing body
        const body = parseAST();
        const end = match(")").end;
        return new ast_1.Lambda(begin, end, parameters, body);
    }
    function parseSList(begin) {
        // matched "("
        let values = [];
        let list = true;
        while (!cur().is(")")) {
            if (cur().trivial()) {
                values.push(parseSimpleToken());
            }
            else if (cur().is("(")) {
                const begin_ = match("(").begin;
                values.push(parseSList(begin_));
            }
            else if (cur().is(".")) { //
                match(".");
                values.push(parseQuote(cur().begin));
                match(")");
                list = false;
                break;
            }
            else {
                throw `Unexpected token ${cur().content} at ${cur().begin} when parsing s-list`;
            }
        }
        if (list) {
            const pos = match(")").begin;
            values.push(new ast_1.NilLiteral(pos, pos));
        }
        let acc = null;
        for (let i = values.length - 1; i >= 0; i--) {
            if (!acc)
                acc = values[i];
            else {
                acc = new ast_1.PairLiteral(values[i], acc);
            }
        }
        return acc;
    }
    function parseQuote(begin) {
        if (begin === undefined) { // begin with '
            begin = cur().begin;
            match("'");
        }
        let value = null;
        if (cur().is(")")) {
            throw `Unexpected ")" at ${cur().begin.toString()} when parsing quote expression`;
        }
        if (cur().is("(")) { // it is a list or a pair
            match("(");
            value = parseSList(begin);
        }
        else if (cur().trivial()) {
            value = parseSimpleToken();
        }
        return value;
    }
    function parseSimpleToken() {
        switch (cur().token_type) {
            case tokenize_1.TokenType.BOOLEAN_LITERAL:
                return new ast_1.BooleanLiteral(shift());
            case tokenize_1.TokenType.CHAR_LITERAL:
                return new ast_1.CharLiteral(shift());
            case tokenize_1.TokenType.IDENTIFIER:
                return new ast_1.Identifer(shift());
            case tokenize_1.TokenType.INTEGER_LITERAL:
                return new ast_1.IntegerLiteral(shift());
            default:
                throw `Expected simple token, got ${cur().content} at ${cur().begin.toString()}`;
        }
    }
    function parseAST() {
        if (empty()) {
            throw `No more tokens when parsing AST`;
        }
        if (cur().is("(")) { // is a s-expression
            return parseSExpression();
        }
        else if (cur().is("'")) { // its is a quote
            return parseQuote();
        }
        else {
            return parseSimpleToken();
        }
    }
    function parseIf(begin) {
        match("if");
        // parsing cond
        const cond = parseAST();
        const pass = parseAST();
        const fail = parseAST();
        const end = match(")").end;
        return new ast_1.IfStmt(begin, end, cond, pass, fail);
    }
    function parseCond(begin) {
        match("cond");
        let cases = [];
        while (cur().is("(")) {
            match("(");
            const first = parseAST();
            const second = parseAST();
            match(")");
            cases.push([first, second]);
        }
        const end = match(")").end;
        return new ast_1.CondStmt(begin, end, cases);
    }
    function parseBegin(begin) {
        match("begin");
        let stmts = [];
        while (!cur().is(")")) {
            stmts.push(parseAST());
        }
        const end = match(")").end;
        return new ast_1.Begin(begin, end, stmts);
    }
    function parseSExpression() {
        // matched "("
        const begin = shift("(").begin;
        const head = cur().content;
        let res = null;
        if (constants_1.isKeyword(head)) {
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
        }
        else { // function application
            const func = parseAST();
            let parameters = [];
            while (cur() && !cur().is(")")) {
                parameters.push(parseAST());
            }
            const end = match(")").end;
            res = new ast_1.Application(begin, end, func, parameters);
        }
        return res; // FIXME
    }
    let asts = [];
    while (cur()) { // there still tokens
        asts.push(parseAST());
    }
    return asts.length <= 1 ?
        asts[0] :
        new ast_1.Begin(tokens[0].begin, tokens[tokens.length - 1].end, asts);
}
exports.parse = parse;
// noinspection JSUnusedGlobalSymbols
function flatPrint(code, filename) {
    return parse(tokenize_1.tokenize(code, filename)).print();
}
exports.flatPrint = flatPrint;
//# sourceMappingURL=parse.js.map