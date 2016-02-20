
var multer = require('multer');
var crypto = require('crypto');
var express = require('express');

var router = express.Router();
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

router.get('/', function(req,res,next) {
    res.render('product');
});

var dateAddLeadingZero = function(n) {
    return n < 10 ? '0' + n : n;
};

var today = function() {
    var d = new Date();
    var day = dateAddLeadingZero(d.getDate());
    var month = dateAddLeadingZero(d.getMonth() + 1);
    var year = d.getFullYear();

    return year + '-' + month + '-' + day;
};

router.get('/New', function(req,res,next) {
    if (!req.session.isLoggedIn) {
        res.redirect('/Login');//, { message : "You need to be logged in to create a new product." });
    } else {
        var now = today();
        res.render('newProduct', { today: now});
    }
});

router.post('/new', upload.single('photo'), function (req, res, next) {

    // TODO: Error handling and input validation
    // TODO: Handle who is posting
    // TODO: Allow links to images rather than just uploads

    var error = false;

    var productName = req.db.escape(req.body.productName);
    var logoUrl = req.db.escape(req.body.logoUrl);
    var versionNum = req.db.escape(req.body.versionNum);
    var lastUpdate = req.db.escape(req.body.lastUpdate);

    var d = new Date(lastUpdate);
    lastUpdate = "'" + d.getFullYear() + "-" + dateAddLeadingZero(d.getMonth() + 1) + "-" + dateAddLeadingZero(d.getDate()) + "'";

    var insert = "INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES (" + productName + ',' + logoUrl + ',' + versionNum + ',' + lastUpdate + ',' + req.session.user.userId + ');';

    console.log("Inserting: " + insert);

    var query = req.db.query(insert, function (err, rows) {
        if (err) throw err; // TODO: Handle error gracefully

        console.log("Inserted: " + JSON.stringify(rows));
    });

    res.redirect('/');
});

router.get('/:pname', function(req,res,next) {

    var comments = [];
    var product = {};
    var selectPQ = "SELECT * FROM products WHERE productName = \'" + req.params.pname + "\'";

    console.log(selectPQ);
	
    var productQuery = req.db.query(selectPQ,  function(err, pRows) {
        if(pRows == null){
            res.redirect('/About');
        } else {
            var product = pRows[0];
            var selectCQ = "SELECT * FROM comments WHERE productId = \'" + product.productId + "\'";
            var commentsQuery = req.db.query(selectCQ , function(err, cRows) {
                var Pcomments = cRows;
                res.render('product', { productName : product.productName, logoUrl: product.logoUrl, version: product.version, lastUpdate: product.lastUpdate, comments: Pcomments});
            });
        }
    });

});

module.exports = router;


