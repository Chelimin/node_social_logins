var express        = require('express');
var path           = require('path');
var logger         = require('morgan');
var bodyParser     = require('body-parser');
var app            = express();
var mongoose       = require('mongoose');
var passport       = require('passport');
var expressSession = require('express-session');
var cookieParser   = require("cookie-parser");


var GitHubStrategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = "60cf3c3f10bafed9801c";
var GITHUB_CLIENT_SECRET = "95e62b416c017456670f5796cf571fed988accc2";


// Mongoose Setup
mongoose.connect('mongodb://localhost:27017/facebook-authentication-app');

// Middleware
app.use( cookieParser() );
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Setting up the Passport Strategies
require("./config/passport")(passport)

// Add code here:
app.get('/', function(req,res){
  res.render('layout', {user: req.user});
});

app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

app.get('/auth/facebook/callback',
passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
  })
);

app.get('/auth/github',
  passport.authenticate('github'),function(req,res){});

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/logout', function(req,res){
  req.logout();
  res.redirect("/");
})


app.listen(3000);
