var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var mysql           = require('mysql');
var fs              = require('fs');
var session         = require('express-session');
var crypto          = require('crypto');
var passport        = require('passport');
var GoogleStrategy  = require('passport-google-oauth2').Strategy;
var https           = require('https');
var qs              = require('querystring');

//Routes
var index           = require('./routes/index');
var login           = require('./routes/login');
var users           = require('./routes/users');
var userprofile     = require('./routes/userprofile');
var product         = require('./routes/product');

//Server constants
const debugServer = "localhost:3000";
const prodServer = "ec2-52-26-176-89.us-west-2.compute.amazonaws.com:3000";
const SERVER = debugServer;
const GOOGLE_CLIENT_ID = "159196631200-d1cf3beikgm0km95rjnvierd952ig5kc.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "R_mG-IVJm5zYdENS42Hld4y2";

// Setup Passport framework for authentication against 3rd party libraries
passport.serializeUser(function(user, done) {
    done(null,user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Handles interactions with Google for user authentication
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://" + SERVER + "/auth/google/callback",
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
        // User has successfully authenticated with Google.
        // profile contains Google Profile information.
        return done(null, profile);
    }

));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Express basic setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Create session
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: '48fhiw34598vio40fp3490g890fjg23oppotg548du54'
}));
app.use( passport.initialize());
app.use( passport.session());

// Create a connection to the database
var db = mysql.createConnection({
    host: 'localhost',
    user: 'STTserver',
    password: 'tech31',
    database: 'STTDB'
});

// Attach DB and Session to request
app.use(function(req,res,next) {
    req.db = db;
    res.locals.session = req.session;
    res.locals.passUser = req.user;
    req.server = SERVER;
    next();
});

// Route requests
app.use('/', index);
app.use('/', login);
app.use('/users', users);
app.use('/userprofile', userprofile);
app.use('/product', product);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
/*
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}*/

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        status: err.status,
        message: err.message,
        error: {}
    });
});

module.exports = app;
