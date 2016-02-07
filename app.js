var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var session = require('express-session');
var crypto = require('crypto');

var routes = require('./routes/index');
var users = require('./routes/users');
var userprofile = require('./routes/userprofile');
var product = require('./routes/product');

var app = express();

const debugServer = "localhost:3000";
const prodServer = "ec2-52-26-176-89.us-west-2.compute.amazonaws.com:3000";

const SERVER = prodServer;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
    req.server = SERVER;
    next();
});

app.use('/', routes);
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
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
