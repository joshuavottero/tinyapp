const getUserByEmail = function(userToFind, dataBase) {
  if (userToFind === undefined || userToFind === "") {
    return undefined;
  }
  for (const user in dataBase) {
    if (dataBase[user]["email"] === userToFind) {
      return dataBase[user]["id"];
    }
  }
  return undefined;
};

// this code taken from https://www.programiz.com/javascript/examples/generate-random-strings  (example 1)
// modified result declare to not have a space the rest of the code is the same
const generateRandomString = function(chars) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < chars; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = function(id, urlDatabase) {
  let urlArray = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      urlArray[url ] = urlDatabase[url];
    }
  }
  return urlArray;
};
module.exports = {getUserByEmail, generateRandomString, urlsForUser};