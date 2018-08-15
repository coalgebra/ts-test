/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');
const tokenizer = require('../app/build/tokenize');

describe("Simple tests for tokenizer", () => {
    it('should work for parentheses and identifiers', function () {
        const codes = [
            `(( ) a() b(c(( )d)d))`,
            `(define a->b (lambda (a) (lambda (b) b)))`,
        ];
        codes.map(code => {
            assert.strictEqual(
                code.split("").filter(x => x !== " ").join(""),
                tokenizer.tokenize(code).map(x => x.content).join("")
            );
        });
    });
    it('should work for boolean , character , and number literals', function () {
        const codes = [
            `(define true #t)`,
            `(define false #f)`,
            `(display #\\@)`
        ];
        codes.map(code => {
            assert.strictEqual(
                code.split("").filter(x => x !== " ").join(""),
                tokenizer.tokenize(code).map(x => x.content).join("")
            );
        });
    });
    it('should work for inline and block comments', function () {
        const tests = [
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
        tests.map(pair => {
            const [a, b] = pair;
            assert.strictEqual(
                tokenizer.tokenize(a).map(x => x.content).join(""),
                tokenizer.tokenize(b).map(x => x.content).join("")
            );
        });
    });
});
