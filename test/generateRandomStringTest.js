const { assert } = require('chai');

// generateRandomString uses code taken from https://www.programiz.com/javascript/examples/generate-random-strings  (example 1)
const { generateRandomString } = require('../helpers');

describe('generateRandomString', function() {
  it('should return 6 chars', function() {
    const string = generateRandomString(6);
    console.log(string);
    assert.equal(string.length, 6);
  });

  it('should return 3 chars', function() {
    const string = generateRandomString(3);
    assert.equal(string.length, 3);
  });

  it('should return 0 chars', function() {
    const string = generateRandomString();
    assert.equal(string.length, 0);
  });
});