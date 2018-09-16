/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');
const desugar = require("../app/build/desugar").desugar_test;

function testPairs(cases) {
    cases.map(cases => {
        assert.strictEqual(desugar(cases[0]), cases[1]);
    });
}

describe("Some simple tests for desugar process", () => {
    it('should work for condition statement', function () {
        const tests = [
            [`(cond (else a))`, `a`],
            [`(cond (a b)
                (else c))`, `(if a b c)`],
            [`(cond (a b) (c d) (else f))`,
             `(if a b (if c d f))`]
        ];
        testPairs(tests);
    });
    it('should work for let statement', function () {
        const tests = [
            [`(let ((x 2)) x)`, `((lambda (x) x) 2)`],
            [`(let ((x 1))
               (let ((x 2) (y x))
                 y))`, `((lambda (x) ((lambda (x y) y) 2 x)) 1)`],
            [`(let ((x 1))
               (let* ((x 2) (y x))
                y))`, `((lambda (x) ((lambda (x) ((lambda (y) y) x)) 2)) 1)`]
        ];
        testPairs(tests);
    });

});
