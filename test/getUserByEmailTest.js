const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const noEmailTestUsers = {
  "userRandomID": {
    id: "userRandomID",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    password: "dishwasher-funk"
  }
};

const noIdTestUsers = {
  "userRandomID": {
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined with unvalid email', function() {
    const user = getUserByEmail("fake@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

  it('should return undefined with empty email', function() {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

  it('should return undefined with no dataBase', function() {
    const user = getUserByEmail("user@example.com");
    const expectedUserID = undefined;
    console.log(user);
    assert.equal(user, expectedUserID);
  });

  it('should return undefined with dataBase with no email', function() {
    const user = getUserByEmail("user@example.com", noEmailTestUsers);
    const expectedUserID = undefined;
    console.log(user);
    assert.equal(user, expectedUserID);
  });

  it('should return undefined with dataBase with no id', function() {
    const user = getUserByEmail("user@example.com", noIdTestUsers);
    const expectedUserID = undefined;
    console.log(user);
    assert.equal(user, expectedUserID);
  });
});