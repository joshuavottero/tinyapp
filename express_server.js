const express = require('express');

const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'user_id',
  keys: ["key"] // should be in seprate file
}))

// this code taken from https://www.programiz.com/javascript/examples/generate-random-strings  (example 1)
// code has been modifedy to not take prams and will aways return a string of 6 chars  
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
 
  return result;
};
const getUserByEmail = function(userToFind, dataBase) {  
  if (userToFind === undefined || userToFind == "") {
    return undefined;
  }
  for (const user in dataBase) {
    if (dataBase[user]["email"] === userToFind) {
      return dataBase[user];
    }
  }
  return undefined;

}

const urlsForUser = function(id) {
  let urlArray = {}
  for (url in urlDatabase) {
    console.log("url data",urlDatabase[url]);
    if (urlDatabase[url]["userID"] === id) {
      urlArray[url ] = urlDatabase[url];
    }
  }
  console.log(urlArray);
  return urlArray;
}

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

}



app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: undefined
  };
  res.render("urls_register", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: undefined
  };
  res.render("urls_login", templateVars);
});

app.post("/urls/login", (req, res) => {
  res.redirect("/login");
});

app.post('/register', (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 404;
    res.end('404 Bad Request, password and username must not be empty');
  }

  if (getUserByEmail(req.body.email, users) !== undefined) {
    res.statusCode = 404;
    res.end('404 Bad Request email is all ready in use');
  }
  const password = bcrypt.hashSync(req.body.password, 10);
  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: password 
  }
  console.log(users);
  req.session.user_id = users[randomID].id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  user = getUserByEmail(req.body.email, users);
  if (user === undefined) {
    res.statusCode = 403;
    res.end('403 Forbidden, user not found');
  }
  if (!bcrypt.compareSync(req.body.password,user.password)){
    res.statusCode = 403;
    res.end('403 Forbidden, password does not match user');
  }
  console.log(req.session.user_id);
  req.session.user_id = user.id;
  res.redirect("/urls");
  console.log(req.session.user_id);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b><body></html>\n');
});

app.get('/urls', (req, res) => {
  console.log(req.session.user_id);
  if(req.session["user_id"] === undefined) {
    res.redirect("/login");
  }else {
  //users[req.session["user_id"]], 
  //console.log("email",users[req.session["user_id"]]["userID"]);
  const templateVars = {
    user: users[req.session["user_id"]]["email"], 
    userID: req.session["user_id"],
    urls: urlsForUser(req.session["user_id"])
  };
  console.log("user_id:",req.session["user_id"]);
  console.log(templateVars);
  res.render('urls_index', templateVars);

  }
 
});


app.get('/urls/new', (req, res) => {
  if(!req.session["user_id"]) {
    res.statusCode = 403;
    res.end('403 Forbidden, must be login to create new url');
  }
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("cookie id",req.session["user_id"]);
  if (!req.session["user_id"]) {
    res.statusCode = 403;
    res.end('403 Forbidden, must be login to create new url');
  }
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };

  res.redirect(`/urls/${newShortUrl}`);
 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("shortUrl",urlDatabase[req.params.shortURL]);
  if (!req.session["user_id"]){
    res.statusCode = 403;
    res.end('403 Forbidden user must be login');
  } else if (urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]) {
    res.statusCode = 403;
    res.end('403 Forbidden user does not own this url');
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  res.redirect("/urls/" + req.params.shortURL);
});



app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.end('404 Page Not Found');
  }
  
});


app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    user: users[req.session["user_id"]]["email"], 
    //userID: req.session["user_id"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"]
  }; // longURL may need to change
  res.render('urls_show', templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session["user_id"]){
    res.statusCode = 403;
    res.end('403 Forbidden user must be login');
  } else if (urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]) {
    res.statusCode = 403;
    res.end('403 Forbidden user does not own this url');
  } else {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  }

});




//mabey needed?
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
