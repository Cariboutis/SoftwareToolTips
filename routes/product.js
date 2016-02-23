var url = require('url');
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

//TODO Should return a list of products with the same name, but different versions
router.get('/:pname', function(req,res,next) {
    /*
    var comments = [];
    var product = {};
    var selectPQ = "SELECT * FROM products WHERE productName = \'" + req.params.pname + "\'";

    console.log(selectPQ);
	
    var productQuery = req.db.query(selectPQ,  function(err, pRows) {
        if(pRows == null){
            res.redirect('/About');
        } else {
            var product = pRows[0];
            var selectCQ = "SELECT * FROM comments INNER JOIN users ON comments.userId=users.userId WHERE productId = \'" + product.productId + "\'";
            var commentsQuery = req.db.query(selectCQ , function(err, cRows) {
                var Pcomments = cRows;
                res.render('product', { productName : product.productName, logoUrl: product.logoUrl, version: product.version, lastUpdate: product.lastUpdate, comments: Pcomments});
            });
        }
    });
    */
});

router.get('/:pname/stats', function(req,res,next) {

    var version = url.parse(req.url, true).query.version || "";
    var pname = req.db.escape(req.params.pname);

    var query = "SELECT version FROM products WHERE productName = " + pname;

    req.db.query(query, function(err, rows) {
        if(err) throw err;

        if(rows.length == 0) {
            next();
        } else {
            var versions = rows.map(function(v) {
                return v.version;
            });
            res.render('stats', {
                productName:req.params.pname,
                versions:versions,
                selectedVersion:version,
                server: req.server
            });
        }
    });
});

router.get('/:pname/statData', function(req,res,next) {
    var pname =  req.db.escape(req.params.pname);

    var query = "SELECT c.commentId as id, c.overallRate as o, c.learnability as l, c.easeOfUse as e, c.compatibility as c, c.documentation as d, p.version as v "+
        "FROM products p " +
        "RIGHT JOIN comments c " +
        "ON c.productId = p.productId "+
        "WHERE p.productName = "+pname+";";

    req.db.query(query, function(err, rows) {
        if(err) throw err;

        //Compress ratings into single arrays instead of JSON
        res.send( rows.map(function(v) {
            return [v.id, v.o, v.l, v.e, v.c, v.d, v.v];
        }));
    });
});

router.get('/:pname/:vnum', function(req,res,next) {

    var pname =  req.db.escape(req.params.pname);
    var vnum = req.db.escape(req.params.vnum);
    var query = "SELECT * FROM products WHERE productName = " + pname + " AND version = " + vnum + "";

    var productQuery = req.db.query(query,  function(err, rows) {
        if(err) throw err;

        if(rows.length == 0){
            next();
        } else {

            var product = rows[0];
            var selectCQ = "SELECT * FROM comments INNER JOIN users ON comments.userId=users.userId WHERE productId = \'" + product.productId + "\' LIMIT 25";
            var commentsQuery = req.db.query(selectCQ , function(err, cRows) {
                var Pcomments = cRows;
                res.render('product', { product: product, comments: Pcomments});
            });
        }
    });

});

module.exports = router;


