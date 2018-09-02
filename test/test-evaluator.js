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
            [`(display 1)`, `1#<void>`],
            [`(newline)`, `\n#<void>`],
            [`(not #t)`, `#f`],
            [`(nand #t #f)`, `#t`],
            [`(null? '())`, `#t`],
            [`(null? '(1))`, `#f`]
        ];
        testPairs(tests);
    });
    it('should work for lambda expression', function () {
        const tests = [
            [`(lambda (x) x)`, `#<procedure>`],
            [`(lambda (x y) x)`, `#<procedure>`]
        ];
        testPairs(tests);
    });
    it('should work for application', function () {
        const tests = [
            [`((lambda () 1))`, `1`],
            [`((lambda (x) x) 1)`, `1`],
            [`(((lambda (x) x) (lambda (x) x)) 1)`, `1`],
            [`((lambda (x y) x) 1 2)`, `1`]
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
    it('should work for pairs', function () {
        const tests = [
            [`(car '(1))`, `1`],
            [`(cdr '(1))`, `()`],
            [`(cons 1 2)`, `(1 . 2)`],
            [`(cons 1 '())`, `(1)`],
            [`(begin
                (define cadr (lambda (x) (car (cdr x))))
                (cadr '(1 (1))))`, `(1)`]
        ];
        testPairs(tests);
    });
    it('should work for let and let*', function () {
        const tests = [
            [`(let ((x 1)) x)`, `1`],
            [`(let ((x 1))
               (let ((x 2) (y x))
                y))`, `1`],
            [`(let ((x 1))
               (let* ((x 2) (y x))
                y))`, `2`]
        ];
        testPairs(tests);
    });
    it('should work for letrec', function () {
        const tests = [
            [`(letrec 
                ((x (lambda (n) 
                    (if (eq? n 0) 0 (y (- n 1)))))
                 (y (lambda (n) 
                    (if (eq? n 0) 1 (x (- n 1))))))
                (x 6))`, `0`],
            [`(letrec 
                ((x (lambda (n) 
                    (if (eq? n 0) 0 (y (- n 1)))))
                 (y (lambda (n) 
                    (if (eq? n 0) 1 (x (- n 1))))))
                (x 5))`, `1`]
        ];
        testPairs(tests);
    });
});

describe("Some complex tests for evaluator", () => {
    it('should work for binding shadows', function () {
        const tests = [
            [`(begin
                (define a 1)
                (begin (define a 2)
                       (display a))
                a)`, `21`],
            [`(begin
                (define a 1)
                (begin (define a 2)
                       (set! a 3)
                       (display a))
                a)`, `31`],
            [`(begin
                (define a 1)
                (begin (set! a 3)
                       (display a))
                a)`, `33`],
        ];
        testPairs(tests);
    });
    it('should work for lambda-define syntax sugar', function () {
        const tests = [
            [`(begin (define (id x) x)
                id)`, `#<procedure>`],
            [`(begin 
                (define (const x y) x)
                (const 1 2))`, `1`],
        ];
        testPairs(tests);
    });
    it('should work for lambda-begin syntax sugar', function () {
        const tests = [
            [`((lambda (x) (display x) x) 1)`, `11`]
        ];
        testPairs(tests);
    });
    it('should work for a complex cases', function () {
        const tests = [ [
            `
(define (map xs f) 
 (if (null? xs) 
     '()
     (cons (f (car xs)) 
           (map (cdr xs) f))))
(display (map '(1 2 3) (lambda (x) (+ x 1))))
(newline)
(define (fold xs f acc)
 (if (null? xs)
     acc
     (f (car xs) (fold (cdr xs) f acc))))
(define (add x y) (+ x y))
(fold '(1 2 3) add 0)
(define (yield xs) 
  (begin
    (define res xs)
    (define (gen) 
      (if (null? res) '()
          ((lambda (x)
            (set! res (cdr res))
            x) (car res))))
    gen))
(define g (yield '(1 2 3)))
(display (g))
(display (g))
(display (g))
(display (g))
(newline)
(define (get/cc) (call/cc (lambda (x) x)))
(define cc #f)
(set! cc (get/cc))
(cc 1)
(display cc)
(newline)
(display 
    ((lambda (n)
     ((lambda (fact)
       ((fact fact) n))
       (lambda (fact)
       (lambda (n)
           (if (eq? 0 n)
               1
               (* n ((fact fact) (- n 1)))))))) 5))`,
            `(2 3 4)\n123()\n1\n120#<void>`]
        ];
        testPairs(tests);
    });
});
