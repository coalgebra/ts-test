/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');
const parse = require('../app/build/parse').flatPrint;

describe("Simple tests for parser", () => {
    it('should parse define correctly', function () {
        const codes = [
            `(define a 1)`,
            `(define b (+ 1 2))`,
            `(define test '())`
        ];
        codes.map(code => {
            assert.strictEqual(parse(code), code);
        });
    });
});
