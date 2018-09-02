"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSpace(char) {
    return char !== "" && " \n\r\t".includes(char);
}
exports.isSpace = isSpace;
class CodePosition {
    constructor(line, column, offset, filename) {
        this.line = line;
        this.column = column;
        this.offset = offset;
        this.filename = filename;
    }
    fine() {
        return this.column >= 0 && this.line >= 0;
    }
    toString() {
        return `${this.filename}:${this.line + 1}:${this.column + 1}`;
    }
}
exports.CodePosition = CodePosition;
var Parentheses;
(function (Parentheses) {
    Parentheses[Parentheses["LEFT"] = 0] = "LEFT";
    Parentheses[Parentheses["SLEFT"] = 1] = "SLEFT";
    Parentheses[Parentheses["RIGHT"] = 2] = "RIGHT";
    Parentheses[Parentheses["SRIGHT"] = 3] = "SRIGHT";
})(Parentheses = exports.Parentheses || (exports.Parentheses = {}));
var TokenType;
(function (TokenType) {
    TokenType["IDENTIFIER"] = "ID";
    TokenType["PARENTHESE"] = "PARENTHESE";
    TokenType["CHAR_LITERAL"] = "CHAR";
    TokenType["INTEGER_LITERAL"] = "INTEGER";
    TokenType["BOOLEAN_LITERAL"] = "BOOLEAN";
    TokenType["STRING_LITERAL"] = "STRING";
    TokenType["QUOTE"] = "QUOTE";
    TokenType["VOID"] = "VOID";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
class Token {
    constructor(begin, end, content, token_type, value) {
        this.begin = begin;
        this.end = end;
        this.content = content;
        this.value = value;
        this.token_type = token_type;
    }
    is(condition) {
        if (typeof condition === "string") {
            return this.content === condition;
        }
        else if (typeof condition === "number") {
            return this.token_type === TokenType.INTEGER_LITERAL && this.value === condition;
        }
        else if (condition in Parentheses) {
            return this.value === condition;
        }
        else {
            return this.token_type === condition;
        }
    }
    trivial() {
        switch (this.token_type) {
            case TokenType.BOOLEAN_LITERAL:
            case TokenType.CHAR_LITERAL:
            case TokenType.IDENTIFIER:
            case TokenType.INTEGER_LITERAL:
            case TokenType.STRING_LITERAL:
                return true;
            default:
                return false;
        }
    }
}
exports.Token = Token;
function tokenize(code, filename) {
    let position = new CodePosition(0, 0, 0, filename);
    let tokens = [];
    let comment_counter = 0;
    function step() {
        if (position.offset >= code.length - 1) { // reach the end
            position = new CodePosition(-1, -1, position.offset + 1, filename);
        }
        else {
            if (code[position.offset] === '\n') {
                position.line++;
                position.column = 0; // reset position
            }
            else {
                position.column++;
            }
            position.offset++;
        }
    }
    function cur() {
        if (position.fine()) {
            return code[position.offset];
        }
        return "";
    }
    function skipSpaces() {
        while (true) {
            if (!position.fine())
                return;
            if (" \n\r\t".includes(code[position.offset])) {
                step();
            }
            else {
                break;
            }
        }
    }
    function getParenthese(head, begin) {
        switch (head) {
            case "[":
                comment_counter || tokens.push(new Token(begin, begin, head, TokenType.PARENTHESE, Parentheses.SLEFT));
                break;
            case "]":
                comment_counter || tokens.push(new Token(begin, begin, head, TokenType.PARENTHESE, Parentheses.SRIGHT));
                break;
            case "(":
                comment_counter || tokens.push(new Token(begin, begin, head, TokenType.PARENTHESE, Parentheses.LEFT));
                break;
            case ")":
                comment_counter || tokens.push(new Token(begin, begin, head, TokenType.PARENTHESE, Parentheses.RIGHT));
                break;
        }
    }
    while (position.fine()) {
        skipSpaces();
        const begin = new CodePosition(position.line, position.column, position.offset, filename);
        const head = cur();
        step();
        if (head.length === 0) {
            break;
        }
        if (head === "#") { // boolean literals
            const second = cur();
            step();
            switch (second) {
                case "t": // true literal : #t
                    comment_counter || tokens.push(new Token(begin, position, "#t", TokenType.BOOLEAN_LITERAL, true));
                    break;
                case "f": // false literal : #f
                    comment_counter || tokens.push(new Token(begin, position, "#f", TokenType.BOOLEAN_LITERAL, false));
                    break;
                case "|": // block comment head : #| COMMENT |#
                    comment_counter++;
                    break;
                case "\\": // char literal : #\@ #\*
                    const third = cur();
                    step();
                    comment_counter || tokens.push(new Token(begin, position, `${head}${second}${third}`, TokenType.CHAR_LITERAL, third));
                    break;
                default:
                    throw `Expected ${second} after '#' at ${position.toString()}`;
            }
            continue;
        }
        if (head === ".") {
            comment_counter || tokens.push(new Token(begin, begin, ".", TokenType.VOID, "."));
            continue;
        }
        if (head === "|") { // maybe block comment end
            if (cur() === "#") { // comment end
                if (comment_counter) {
                    step(); // match #
                    comment_counter--; // enter normal process
                    continue;
                }
                else {
                    throw `Unexpected |# at ${position.toString()}`;
                }
            }
        }
        if ("[()]".includes(head)) { // parentheses
            getParenthese(head, begin);
            continue;
        }
        if (head === ";") { // inline comment
            while (position.fine() && cur() !== "\n")
                step();
            continue;
        }
        if (head === "'") { // quote
            comment_counter || tokens.push(new Token(begin, begin, head, TokenType.QUOTE, head));
            continue;
        }
        if ("0123456789".includes(head)) { // number
            while (position.fine() && !isSpace(cur()) && !("[()]".includes(cur())))
                step();
            let num = code.substr(begin.offset, position.offset - begin.offset);
            if (comment_counter)
                continue;
            if (parseInt(num).toString() === num) { // is number
                tokens.push(new Token(begin, position, num, TokenType.INTEGER_LITERAL, parseInt(num)));
            }
            else {
                throw `Unexpected token ${num} at ${begin.toString()}`;
            }
            continue;
        }
        // identifier
        while (position.fine() && !isSpace(cur()) && !("[()]".includes(cur())))
            step();
        if (comment_counter)
            continue;
        let id = code.substr(begin.offset, position.offset - begin.offset);
        tokens.push(new Token(begin, position, id, TokenType.IDENTIFIER, id));
    }
    if (comment_counter) {
        throw `escaped block comment`;
    }
    return tokens;
}
exports.tokenize = tokenize;
//# sourceMappingURL=tokenize.js.map