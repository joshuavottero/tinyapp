const express = require('express');

const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// function below used logic from https://www.programiz.com/javascript/examples/generate-random-strings  (example 1)
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
 
  return result;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.userName);
  console.log('Cookies: ', req.cookies)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b><body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase
   };
  res.render('urls_index', templateVars);
});


app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;

  res.redirect(`/urls/${newShortUrl}`);
 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
 
});

app.post("/urls/:shortURL", (req, res) => {
  res.redirect("/urls/" + req.params.shortURL);
});



app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.end('404 Page Not Found');

  }
  
});


app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  }; // longURL may need to change
  res.render('urls_show', templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});




//mabey needed?
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
