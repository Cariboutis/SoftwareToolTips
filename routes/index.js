var express = require('express');
var multer = require('multer');
var crypto = require('crypto');
var router = express.Router();

var https = require('https');
var qs = require('querystring');

var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './public/images/')
    },
    filename: function(req,file,cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err);

            cb(null, raw.toString('hex') + Date.now() + '.png');
        });
    }
});

var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.works = "yes";
    res.render('index', { title: 'Software Tool Tips' });
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

router.get('/Product/New', function(req,res,next) {
    res.render('newProduct');
});

router.post('/Product/New', upload.single('photo'), function (req, res, next) {

    // TODO: Error handling and input validation
    // TODO: Handle who is posting

    var productName = req.db.escape(req.body.productName);
    var logoUrl = req.db.escape('/public/images/' + req.file.filename);
    var versionNum = req.db.escape(req.body.version);
    var lastUpdate = req.db.escape(req.body.lastUpdate);

    var insert = "INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES (" + productName + ',' + logoUrl + ',' + versionNum + ',' + lastUpdate + ',1);';

    var query = req.db.query(insert, function(err, rows) {
        if (err) throw err; // TODO: Handle error gracefully

        console.log("Inserted: " + JSON.stringify(rows));
    });

    res.redirect('/');
});

router.get('/Product/:pname', function(req,res,next) {

    var comments = [];
    var product = {};

    var productQuery = db.query('SELECT productId, productName, logoUrl, version, lastUpdate FROM products WHERE productName = \'' + req.params.pname + '\'', function(err, rows) {
        products = rows[0];
    });

    var commentsQuery = db.query('SELECT commentBody, userId FROM comments WHERE productId = \'' + products , function(err, rows) {
        comments = rows;
    });


    var jadeRender = function() {
        res.render('product', { productName : req.params.pname, logoUrl: product.logoUrl, version: product.version, lastUpdate: product.lastUpdate});
    }


});

router.get('/Product', function(req,res,next) {
    res.render('product');
});

module.exports = router;
