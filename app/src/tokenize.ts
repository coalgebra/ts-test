import {BooleanLiteral, CharLiteral, Identifer, IntegerLiteral} from "./ast";

export function isSpace(char: any): boolean {
    return char !== "" && " \n\r\t".includes(char);
}

export class CodePosition {

    line: number;
    column: number;
    offset: number;
    filename: string;

    constructor(line: number, column: number, offset: number, filename: string) {
        this.line = line;
        this.column = column;
        this.offset = offset;
        this.filename = filename;
    }

    fine(): boolean {
        return this.column >= 0 && this.line >= 0;
    }

    toString(): string {
        return `${this.filename}:${this.line + 1}:${this.column + 1}`;
    }
}

export enum Parentheses {
    LEFT,
    SLEFT,
    RIGHT,
    SRIGHT
}

export enum TokenType {
    IDENTIFIER = "ID",
    PARENTHESE = "PARENTHESE",
    CHAR_LITERAL = "CHAR",
    INTEGER_LITERAL = "INTEGER",
    BOOLEAN_LITERAL = "BOOLEAN",
    STRING_LITERAL = "STRING", // TODO
    QUOTE = "QUOTE",
    VOID = "VOID",
}

export class Token {
    begin: CodePosition;
    end: CodePosition;
    content: string; // store the corresponding code
    token_type: TokenType;
    value: string | boolean | Parentheses;

    constructor(begin: CodePosition, end: CodePosition, content: string, token_type: TokenType, value: string | boolean | Parentheses) {
        this.begin = begin;
        this.end = end;
        this.content = content;
        this.value = value;
        this.token_type = token_type;
    }

    is(condition: string | TokenType | number | Parentheses): boolean {
        if (typeof condition === "string") {
            return this.content === condition;
        } else if (typeof condition === "number") {
            return this.token_type === TokenType.INTEGER_LITERAL && this.value as number === condition;
        } else if (condition in Parentheses) {
            return this.value as Parentheses === condition;
        } else {
            return this.token_type === condition;
        }
    }

    trivial(): boolean {
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

export function tokenize(code: string, filename?: string): Token[] {
    let position = new CodePosition(0, 0, 0, filename);
    let tokens: Token[] = [];
    let comment_counter: number = 0;

    function step() {
        if (position.offset >= code.length - 1) { // reach the end
            position = new CodePosition(-1, -1, position.offset + 1, filename);
        } else {
            if (code[position.offset] === '\n') {
                position.line++;
                position.column = 0; // reset position
            } else {
                position.column++;
            }
            position.offset++;
        }
    }

    function cur(): string {
        if (position.fine()) {
            return code[position.offset];
        }
        return "";
    }

    function skipSpaces(): void {
        while (true) {
            if (!position.fine()) return;
            if (" \n\r\t".includes(code[position.offset])) {
                step();
            } else {
                break;
            }
        }
    }

    function getParenthese(head, begin: CodePosition) {
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
        const begin: CodePosition = new CodePosition(position.line, position.column, position.offset, filename);
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
                    const third = cur(); step();
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
                } else {
                    throw `Unexpected |# at ${position.toString()}`;
                }
            }
        }

        if ("[()]".includes(head)) { // parentheses
            getParenthese(head, begin);
            continue;
        }

        if (head === ";") { // inline comment
            while (position.fine() && cur() !== "\n") step();
            continue;
        }

        if (head === "'") { // quote
            comment_counter || tokens.push(new Token(begin, begin, head, TokenType.QUOTE, head));
            continue;
        }

        if ("0123456789".includes(head)) { // number
            while (position.fine() && !isSpace(cur()) && !("[()]".includes(cur()))) step();
            let num = code.substr(begin.offset, position.offset - begin.offset);
            if (comment_counter) continue;
            if (parseInt(num).toString() === num) { // is number
                tokens.push(new Token(begin, position, num, TokenType.INTEGER_LITERAL, parseInt(num)));
            } else {
                throw `Unexpected token ${num} at ${begin.toString()}`;
            }
            continue;
        }

        // identifier
        while (position.fine() && !isSpace(cur()) && !("[()]".includes(cur()))) step();
        if (comment_counter) continue;
        let id = code.substr(begin.offset, position.offset - begin.offset);
        tokens.push(new Token(begin, position, id, TokenType.IDENTIFIER, id));
    }
    if (comment_counter) {
        throw `escaped block comment`;
    }
    return tokens;
}
