var express = require('express');
var router = express.Router();

var https = require('https');
var qs = require('querystring');


/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.works = "yes";
    res.render('index', { title: 'Software Tool Tips' });
});

// Render About page
router.get('/about', function(req,res) {
    console.log(req.session.works);
    res.render('about');
});


module.exports = router;
