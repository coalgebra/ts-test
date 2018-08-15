/* global describe, it, beforeEach */
'use strict';
const assert = require('assert');

describe("This is a simple test", () => {
    it("should work for 1 + 1 = 2", () => {
        assert.equal(1 + 1, 2);
    });
    it("should work for 2 - 2 = 0", () => {
        assert.equal(2 - 2, 0);
    });
});
