const express = require('express');
// generateRandomString uses code taken from https://www.programiz.com/javascript/examples/generate-random-strings  (example 1)
const {getUserByEmail, generateRandomString, urlsForUser} = require('./helpers');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ["key"]
}));

const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  '9sm5xk': {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  },
  'esmkxk': {
    longURL: "http://www.google.com",
    userID: "kkkeee"
  }
};

const users = {
  "aJ48lW" : {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "kkkeee" : {
    id: "kkkeee",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "user3RandomID" : {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("123", 10)
  },

};



app.get('/', (req, res) => {
  if (req.session["user_id"] === undefined) {
    return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  }
});

app.get('/register', (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: undefined
  };
  return res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 404;
    return res.end('404 Bad Request, password and username must not be empty\n');
  }

  if (getUserByEmail(req.body.email, users) !== undefined) {
    res.statusCode = 404;
    return res.end('404 Bad Request email is all ready in use\n');
  }
  const password = bcrypt.hashSync(req.body.password, 10);
  const randomID = generateRandomString(6);
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: password
  };
  req.session["user_id"] = users[randomID].id;
  return res.redirect("/urls");
});

app.get('/login', (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: undefined
  };
  return res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user === undefined) {
    res.statusCode = 403;
    return res.end('403 Forbidden, user not found\n');
  }
  if (!bcrypt.compareSync(req.body.password,users[user]["password"])) {
    res.statusCode = 403;
    return res.end('403 Forbidden, password does not match user\n');
  }
  req.session["user_id"] = user;
  return res.redirect("/urls");
});

app.post("/urls/login", (req, res) => {
  return res.redirect("/login");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  return res.redirect("/login");
});

app.get('/urls', (req, res) => {
  if (req.session["user_id"] === undefined) {
    res.statusCode = 403;
    return res.end('403 Forbidden, must be login to look at urls\n');
  } else {
    const templateVars = {
      user: users[req.session["user_id"]]["email"],
      userID: req.session["user_id"],
      urls: urlsForUser(req.session["user_id"], urlDatabase)
    };
    return res.render('urls_index', templateVars);
  }
 
});


app.get('/urls/new', (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session["user_id"]]["email"],
  };
  return res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 Forbidden, must be login to create new url\n');
  }
  const newShortUrl = generateRandomString(6);
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };

  return res.redirect(`/urls/${newShortUrl}`);
 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 Forbidden user must be login\n');
  } else if (urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 Forbidden user does not own this url\n');
  } else {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.statusCode = 403;
    return res.end('403 given ID does not exist\n');
  }
  if (!req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 user must be login to view a url\n');
  }
  if (urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 user does own this url\n');
  }
  const templateVars = {
    user: users[req.session["user_id"]]["email"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"]
  };
  return res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    return res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.end('404 Page Not Found the longURL may be set wrong or the shortURL does not exist\n');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 Forbidden user must be login\n');
  } else if (urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]) {
    res.statusCode = 403;
    return res.end('403 Forbidden user does not own this url\n');
  } else {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    return res.redirect("/urls");
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
