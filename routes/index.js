var express = require('express');
var router = express.Router();

var https = require('https');
var qs = require('querystring');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'STTserver',
    password: 'tech31',
    database: 'STTDB'
});

/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.works = "yes";
  res.render('index', { title: 'Express' });
});

router.get('/SignUp', function(req,res,next) {
    req.session.username = "Me!";
   res.render('login', {title: 'Log In'});
});

router.post('/tokensignin', function(req,res) {
    var idtoken = req.body.idtoken;
    var name = req.body.name;
    var email = req.body.email;

    var options = {
        host: 'www.googleapis.com',
        path: '/oauth2/v3/tokeninfo?' + qs.stringify({id_token: idtoken}),
        method: 'GET',
        accept: '*/*'
    };


    var result = https.request(options, function(response) {
        if(response.statusCode == 200){
            req.session.loggedIn = true;
            req.session.email = email;
            req.session.name = name;
        }

        console.log(response.statusCode);

        res.send("OK");
    });

    result.end();

    result.on('error', function(e) {
       console.error(e);
    });



});

router.get('/About', function(req,res,next) {
    console.log(req.session.works);
   res.render('about');
});

router.get('/Databases', function(req,res,next) {
    var users = [];
    var comments = [];
    var products = [];

    var usersDb = connection.query('SELECT * from users', function(err,rows) {
        if(err) throw err;
	
        users = rows;

	var commentsDb = connection.query('SELECT * from comments', function(err, rows) {
	    if (err) throw err;

	    comments = rows;

	    var productsDb = connection.query('SELECT * from products', function(err, rows) {
		if (err) throw err;

		products = rows;

		res.write('<br><br>Users<br>');
		res.write(JSON.stringify(users));
		res.write('<br><br>Comments<br>');
		res.write(JSON.stringify(comments));
		res.write('<br><br>Products<br>');
		res.write(JSON.stringify(products));
		res.end();
	    });
	});
    });
});

module.exports = router;
