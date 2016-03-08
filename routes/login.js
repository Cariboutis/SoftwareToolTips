/**
 * Created by Nathan on 2/15/2016.
 */
var passport = require('passport');
var express = require('express');
var router = express.Router();

// Render the login page
router.get('/login', function(req,res,next) {
    if(req.session.isLoggedIn){
        res.redirect('/');
    } else {
        res.render('login', {title: 'Log In', server: req.server});
    }
});

// Have user log in with their google account
router.get('/auth/google', passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'],
    prompt: 'select_account'
}));

// Google redirects user to this after token authenticated
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful Google authentication
        var email = req.user.email;

        var e = req.db.escape(email);
        var select = "SELECT userId, username, email FROM users WHERE email = " + e + "";

        req.db.query(select, function(err, rows) {
            if(err){
                res.statusCode = 500;
                res.redirect('error');
            } else {
                req.session.isAuthenticated = true;
                req.session.email = email;

                var user = rows[0];
            }

            if(user != undefined){
                req.session.isLoggedIn = true;
                req.session.user = user;
                if(req.session.lastPage) {
                    res.redirect(req.session.lastPage);
                } else {
                    res.redirect('/');
                }

            } else {
                if (req.user.photos.length > 0) {
                  req.session.profileImageUrl = req.user.photos[0].value;
                }
                res.redirect('/createUser')
            }

        });
    }
);

router.get('/logout', function(req, res){
    req.session.destroy();
    res.locals.session = req.session;
    req.logout();
    res.redirect('/');
});

// Render create user page as long as they are authenticated
router.get('/createUser', function(req,res) {
    if(req.session.isAuthenticated && !req.session.isLoggedIn){
        res.render('createUser');
    } else {
        res.redirect('/');
    }
});

// Create new user as long as they are authenticated and not logged in
router.post('/createUser', function(req,res) {
    if(req.session.isLoggedIn || !req.session.isAuthenticated){
        res.send("What are you trying to do here?");
    } else {
        var username = req.body.username;
        var email = req.session.email;
        var profileImageUrl = req.session.profileImageUrl;

        var insert = "INSERT INTO users SET ?";

        req.db.query(insert, {username:username,email:email,profileImageUrl:profileImageUrl}, function(err, result) {
            if (err) throw err; // TODO: Handle error gracefully

            var select = "SELECT userId, username, email FROM users WHERE userId = " + result.insertId + "";

            req.db.query(select, function(err, rows) {
                if (err) throw err; // TODO: Handle error gracefully
                req.session.isLoggedIn = true;
                req.session.user = rows[0];
                if (req.session.lastPage) {
                    res.redirect(req.session.lastPage);
                } else {
                    res.redirect('/');
                }
            });

            console.log("Inserted: " + JSON.stringify(result));

        });

    }
});

module.exports = router;