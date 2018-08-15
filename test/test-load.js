/* global describe, it, beforeEach */
'use strict';
var assert = require('assert');

describe('index.js exists', function () {
	/**
	 * Test 1: Project is successfully compiled, and can be imported.
	 */
	it('can be imported without blowing up', function () {
	  assert(require('../app/build/index.js') !== undefined);
	});
});
