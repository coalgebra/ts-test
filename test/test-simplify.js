/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');
const simplify = require("../app/build/simplify").simplify_test;

function testPairs(cases) {
    cases.map(cases => {
        assert.strictEqual(simplify(cases[0]), cases[1]);
    });
}

describe("Some simple tests for simplify process", () => {
    it('should work in application', function () {
        const tests = [
            [`((lambda (x) x) 2)`, `2`],
            [`((lambda (x y) y) (lambda (x) x) 1)`, `1`],
            [`((lambda (x y) (x y)) a b)`, `(a b)`]
        ];
        testPairs(tests);
    });
    it('should work in if-statement', function () {
        const tests = [
            [`(if #t a b)`, `a`],
            [`(if #f a b)`, `b`]
        ];
        testPairs(tests);
    });
});
