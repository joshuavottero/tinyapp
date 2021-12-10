const { assert } = require('chai');

const { urlsForUser } = require('../helpers');


const testUrlDatabase = {
  '626777': {
    longURL: "http://www.lighthouselabs.ca",
    userID: "555444"
  },
  'aaabbb': {
    longURL: "http://www.google.com",
    userID: "lllooo"
  },
  'eeefff': {
    longURL: "http://www.google.com",
    userID: "lllooo"
  }
};

describe('urlsForUser', function() {
  it('should return url array of one url object', function() {
    const dataObjects = urlsForUser("555444", testUrlDatabase);
    console.log(dataObjects);
    assert.deepEqual(dataObjects, {
      '626777': {
        longURL: "http://www.lighthouselabs.ca",
        userID: "555444"
      }
    });
  });

  it('should return url of two url objects', function() {
    const dataObjects = urlsForUser("lllooo",testUrlDatabase);
    assert.deepEqual(dataObjects,  {'aaabbb': {
      longURL: "http://www.google.com",
      userID: "lllooo"
    },
    'eeefff': {
      longURL: "http://www.google.com",
      userID: "lllooo"
    }});
  });

  it('should return empty object bad id', function() {
    const dataObjects = urlsForUser("nouser", testUrlDatabase);
    assert.deepEqual(dataObjects, {});
  });

  it('should return empty object no dataBase', function() {
    const dataObjects = urlsForUser("nouser");
    assert.deepEqual(dataObjects, {});
  });
});