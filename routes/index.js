var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'STTserver',
    password: 'tech31',
    database: 'STTDB'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/SignUp', function(req,res,next) {
   res.render('login', {title: 'Log In'});
});

router.get('/About', function(req,res,next) {
   res.render('about');
});

router.get('/Databases', function(req,res,next) {
    var users = connection.query('SELECT * from users', function(err,rows) {
        if(err) throw err;

        res.send(rows);
    })

});

module.exports = router;
