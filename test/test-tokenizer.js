/* global describe, it, beforeEach */
'use strict';
const isSpace = require("../app/build/tokenize").isSpace;

const assert = require('assert');
const tokenizer = require('../app/build/tokenize');

function selfCheck(cases) {
    cases.map(code => {
        assert.strictEqual(
            code.split("").filter(x => !isSpace(x)).join(""),
            tokenizer.tokenize(code).map(x => x.content).join("")
        );
    });
}

function pairCheck(cases) {
    cases.map(pair => {
        const [a, b] = pair;
        assert.strictEqual(
            tokenizer.tokenize(a).map(x => x.content).join(""),
            tokenizer.tokenize(b).map(x => x.content).join("")
        );
    });
}

describe("Simple tests for tokenizer", () => {
    it('should work for parentheses and identifiers', function () {
        const cases = [
            `(( ) a() b(c(( )d)d))`,
            `(define ab->b (lambda (a) (lambda (b) b)))`,
        ];
        selfCheck(cases);
    });
    it('should work for boolean , character , and number literals', function () {
        const cases = [
            `(define true #t)`,
            `(define false #f)`,
            `(display #\\@)`
        ];
        selfCheck(cases);
    });
    it('should work for inline and block comments', function () {
        const cases = [
            [
                `(define a 1); blah blah`,
                `(define a 1)`
            ],
            [
                `(define #|
                    test #|
                    (lambda (a) a) |#
                    |#
                    a b)`,
                `(define a b)`]
        ];
        pairCheck(cases);
    });
    it('should parse bracket correctly', function () {
        const codes = [
            `(let [(a 1)
                   (b 2)]
                   (begin (+ 1 2))`,
        ];
        selfCheck(codes);
    });
    it('should parse quote correctly', function () {
        const codes = [
            `(display '(1 2 3 ('())))`
        ];
        selfCheck(codes);
    });
});
