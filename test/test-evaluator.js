/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');
const evaluate = require('../app/build/evaluate').test_evaluate;

function testPairs(cases) {
    cases.map(cases => {
        assert.strictEqual(evaluate(cases[0]), cases[1]);
    });
}

describe("Simple tests for evaluator", () => {
    it('should work for literals', function () {
        const tests = [
            [`1`, `1`],
            [`'()`, `()`],
            [`#\\*`, `*`],
            [`#\\@`, `@`]
        ];
        testPairs(tests);
    });
    it('should work for some primitives', function () {
        const tests = [
            [`(+ 1 2)`, `3`],
            [`(and #t #f)`, `#f`],
            [`(or #t #f)`, `#t`],
            [`(display 1)`, `1#<void>`]
        ];
        testPairs(tests);
    });
    it('should work for lambda expression', function () {
        const tests = [
            [`(lambda (x) x)`, `#<procedure>`]
        ];
        testPairs(tests);
    });
    it('should work for application', function () {
        const tests = [
            [`((lambda () 1))`, `1`],
            [`((lambda (x) x) 1)`, `1`],
            [`(((lambda (x) x) (lambda (x) x)) 1)`, `1`],
        ];
        testPairs(tests);
    });
    it('should work for block', function () {
        const tests = [
            [`(begin 1 2)`, `2`],
            [`(begin 1 (lambda (x) x) 3 4 5)`, `5`],
        ];
        testPairs(tests);
    });
    it('should work for definition', function () {
        const tests = [
            [`(begin (define a 1) a)`, `1`],
            [`(begin 
                (define id (lambda (x) x)) 
                (id 1))`, `1`],
            [`(begin 
                (define a 1)
                (define b a)
                b)`, `1`]
        ];
        testPairs(tests);
    });
    it('should work for call-with-current-continuation', function () {
        const tests = [
            [`(call/cc (lambda (x) x))`, `#<continuation>`],
            [`(call/cc (lambda (k) (k 1)))`, `1`],
            [`(call/cc (lambda (k) (+ 2 (k 1))))`, `1`],
            [`(call/cc (lambda (k) (+ 2 3)))`, `5`],
            [`(call/cc (lambda (k) (k k)))`, `#<continuation>`]
        ];
        testPairs(tests);
    });
    it('should work for if statement', function () {
        const tests = [
            [`(if #t 1 2)`, `1`],
            [`(begin 
                (define true #f)
                (if true 
                    #t 
                    #f))`, `#f`]
        ];
        testPairs(tests);
    });
    it('should work for condition statement', function () {
        const tests = [
            [`(cond (#f 1) (#t 2))`, `2`]
        ];
        testPairs(tests);
    });
    it('should work for setbang', function () {
        const tests = [
            [`(begin
                (define a 1)
                (set! a 2) 
                a)`, `2`],
        ];
        testPairs(tests);
    });
});

