var express = require('express');
var router = express.Router();

var https = require('https');
var qs = require('querystring');


/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.works = "yes";
    res.render('index', { title: 'Software Tool Tips' });
});

router.get('/logout', function(req,res) {
    req.session.destroy();
    res.render('logout');
});

router.get('/login', function(req,res,next) {
    if(req.session.isLoggedIn){
        res.redirect('/');
    } else {
        req.session.username = "Me!";
        res.render('login', {title: 'Log In'});
    }
});

router.post('/tokensignin', function(req,res) {
    var idtoken = req.body.idtoken;
    var email = req.body.email;

    var options = {
        host: 'www.googleapis.com',
        path: '/oauth2/v3/tokeninfo?' + qs.stringify({id_token: idtoken}),
        method: 'GET',
        accept: '*/*'
    };

    var result = https.request(options, function(response) {
        if(response.statusCode == 200){
            // User is authenticated by Google
            req.session.isAuthenticated = true;
            req.session.email = email;

            var e = req.db.escape(email);
            var select = "SELECT userId, username, email FROM users WHERE email = " + e + "";

            req.db.query(select, function(err, rows) {
                if (err) throw err; // TODO: Handle error gracefully
                var user = rows[0];

                if(user != undefined){
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                }
                res.send("OK");
            });
        }
    });

    result.end();
    result.on('error', function(e) {
        console.error(e);
    });
});

router.get('/login/authenticate', function(req,res) {
   if(req.session.isLoggedIn){
       res.redirect('/');
   } else if(!req.session.isAuthenticated){
       res.redirect('/login');
   } else {
       res.redirect('/createUser');
   }
});

router.get('/createUser', function(req,res) {
    if(req.session.isAuthenticated && !req.session.isLoggedIn){
        res.render('createUser');
    } else {
        res.redirect('/');
    }
});

router.post('/createUser', function(req,res) {
    if(req.session.isLoggedIn || !req.session.isAuthenticated){
        res.send("What are you trying to do here?");
    } else {
        var username = req.body.username;
        var email = req.session.email;

        var insert = "INSERT INTO users SET ?";

        req.db.query(insert, {username:username,email:email}, function(err, result) {
            if (err) throw err; // TODO: Handle error gracefully

            var select = "SELECT userId, username, email FROM users WHERE userId = " + result.insertId + "";

            req.db.query(select, function(err, rows) {
                if (err) throw err; // TODO: Handle error gracefully
                req.session.isLoggedIn = true;
                req.session.user = rows[0];
                res.redirect('/');
            });

            console.log("Inserted: " + JSON.stringify(result));

        });

    }
});

router.get('/about', function(req,res) {
    console.log(req.session.works);
    res.render('about');
});

module.exports = router;
