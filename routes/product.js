var url = require('url');
var mysql = require('mysql');
var express = require('express');


var router = express.Router();

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

router.post('/new', function (req, res, next) {

    // TODO: Allow uploads rather than just links

    var productName = req.db.escape(req.body.productName);
    var logoUrl = req.db.escape(req.body.logoUrl);
    var versionNum = req.db.escape(req.body.versionNum);
    var lastUpdate = req.db.escape(req.body.lastUpdate);
    var description = req.db.escape(req.body.description);
    var now = req.db.escape(today());
    var tags = req.body.tags.split(",");

    var d = new Date(lastUpdate);
    lastUpdate = "'" + d.getFullYear() + "-" + dateAddLeadingZero(d.getMonth() + 1) + "-" + dateAddLeadingZero(d.getDate()) + "'";

    var values = {
        productName: productName,
        logoUrl: logoUrl,
        version: versionNum,
        lastUpdate: lastUpdate,
        userId: req.session.user.userId,
        description: description,
        uploadDate: now
    };

    // NOTE: This will only work in MySQL
    var insert = "INSERT INTO products SET ?";

    console.log(tags);


    //var insert = "INSERT INTO products (productName, logoUrl, version, lastUpdate, userId, description, uploadDate) VALUES ("
    //    + productName + ',' + logoUrl + ',' + versionNum + ',' + lastUpdate + ',' + req.session.user.userId + ',' + description + ',' + now + ');';

    //console.log("Inserting: " + mysql.format(insert, values));

    var query = req.db.query(insert, values, function (err, rows) {
        if (err) throw err; // TODO: Handle error gracefully

        console.log(rows);

        var productId = rows.insertId;

        if (tags.length < 1) return;

        var insertTags = "INSERT IGNORE INTO tags (tag) VALUES ";
        for (var i = 0; i < tags.length - 1; ++i) {
            insertTags += "(" + req.db.escape(tags[i]) + "),";
        }

        insertTags += "(" + req.db.escape(tags[tags.length-1]) + ")";

        console.log("Inserting: " + mysql.format(insertTags, [tags]));

        req.db.query(insertTags, function(err, rows) {
            if (err) throw err; // TODO: Handle error gracefully

            console.log(rows);

            var insertProductTags = "INSERT INTO productTags VALUES";

            for (var i = 0; i < tags.length - 1; ++i) {
                insertProductTags += "(" + req.db.escape(productId) + ", (SELECT tagId FROM tags where tag=" + req.db.escape(tags[i]) + ")),";
            }

            insertProductTags += "(" + req.db.escape(productId) + ", (SELECT tagId FROM tags where tag=" + req.db.escape(tags[tags.length - 1]) + "))";

            console.log(insertProductTags);

            req.db.query(insertProductTags, function(err, rows) {
                if (err) throw err; // TODO: Handle error gracefully

                console.log(rows);
            })

        })


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
    next();
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


