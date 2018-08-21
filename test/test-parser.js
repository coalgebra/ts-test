/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');
const parse = require('../app/build/parse').flatPrint;

function testCases(codes) {
    codes.map(code => {
        assert.strictEqual(parse(code), code);
    });
}

function testPairs(cases) {
    cases.map(pair => {
        const [a, b] = pair;
        assert.strictEqual(parse(a), b);
    });
}

describe("Simple tests for parser", () => {
    it('should parse define correctly', function () {
        const codes = [
            `(define a 1)`,
            `(define b (+ 1 2))`,
        ];
        testCases(codes);
    });
    it('should parse lambda correctly', function () {
        const codes = [
            `(lambda (x) x)`,
            `(lambda (x) (lambda (y) x))`
        ];
        testCases(codes);
    });
    it('should parse application correctly', function () {
        const codes = [
            `(call/cc (lambda (cont) (cont 1)))`,
            `((y fact) 5)`,
        ];
        testCases(codes);
    });
    it('should parse begin correctly', function () {
        const codes = [
            `(begin 1)`,
            `(begin (begin 2) (begin 2))`,
            `(begin (define a 1) a)`
        ];
        testCases(codes);
    });
    it('should parse if correctly', function () {
        const codes = [
            `(if #t #t #f)`,
            `(if #f a b)`,
            `(if (if a b c) d e)`
        ];
        testCases(codes);
    });
    it('should parse cond correctly', function () {
        const codes = [
            `(cond (#f 1) (else 2))`,
            `(cond (#t 2))`
        ];
        testCases(codes);
    });
    it('should parse quote correctly', function () {
        const cases = [
            [`'id`, `id`],
            [`'()`, `'()`],
            [`'(1)`, `(cons 1 '())`],
            [`'(a b c)`, `(cons a (cons b (cons c '())))`],
            [`'(a . b)`, `(cons a b)`],
            [`'(a . ())`, `(cons a '())`]
        ];
        testPairs(cases);
    });
});

function failTest(codes) {
    codes.map((code) => {
        try {
            parse(code);
        } catch (exp) {
            // pass
            return;
        }
        assert.fail();
    });
}

describe("Negative tests for parser", function () {
    it('should reject unmatched parentheses', function () {
        const codes = [
            `(define `,
            `(fuck you ( () `,
            `'(a () ()`
        ];
        failTest(codes);
    });
    it('should reject redefined keywords', function () {
        const codes = [
            `(define define define)`,
            `(define lambda lamdba)`
        ];
        failTest(codes);
    });
    it('should reject incompleted statement', function () {
        const codes = [
            `(define a)`,
            `(lambda ())`,
            `(if #t #f)`,
            `(cond 1)`
        ];
        failTest(codes);
    });
});
