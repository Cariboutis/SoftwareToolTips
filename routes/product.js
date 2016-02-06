/**
 * Created by Nathan on 2/6/2016.
 */
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

router.get('/new', function(req,res,next) {
    res.render('newProduct');
});

router.post('/new', upload.single('photo'), function (req, res, next) {

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

router.get('/:pname', function(req,res,next) {

    var comments = [];
    var product = {};
    var selectQ = "SELECT * FROM products WHERE productName = \'" + req.params.pname + "\'";

    var productQuery = req.db.query(selectQ,  function(err, rows) {
        var product = rows[0];
        res.render('product', { productName : product.productName, logoUrl: product.logoUrl, version: product.version, lastUpdate: product.lastUpdate});
    });

    //var commentsQuery = req.db.query('SELECT commentBody, userId FROM comments WHERE productId = \'' + product.productId , function(err, rows) {
    //    comments = rows;
    //});

});

module.exports = router;


