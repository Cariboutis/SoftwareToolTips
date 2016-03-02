var express = require('express');
var paginate = require('express-paginate');
var url = require('url');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
   // req.session.works = "yes";
    //res.render('index', { title: 'Software Tool Tips' });

    var query="SELECT uploadDate,productName,description,logoUrl,version FROM products ORDER BY uploadDate DESC limit 3 ";
    req.db.query(query, function(err, rows){
        if(err){
            next(err); // throw err;
        } else {
            rows = rows.map(function (product) {

                if (product.description && product.description.length > 255) {
                    product.description = product.description.substring(0, 254) + "...";
                }
                return product;
            });
            res.render('index', {title: 'Software Tool Tips', products: rows});
        }
    });

});

// Render About page
router.get('/about', function(req,res) {
    res.render('about');
});

router.post('/products',function(req,res,next) {
    var p = parseInt(req.body.page);
    var page = isNaN(p)? 1 : p;
    var name = undefined;
    if(req.body.name) {
        name = req.db.escape('%' + (req.body.name || "") + '%');
    }
    var tags = undefined;
    if(req.body["tags[]"]) {
        try {
            if(Array.isArray(req.body["tags[]"])) {
                tags = req.body["tags[]"].map(function (v) {
                    return req.db.escape('%' + v + '%');
                });
            } else {
                tags = [req.db.escape('%' + req.body["tags[]"] + '%')];
            }
        } catch(e){
            console.log(e);
        }
    }
    var pageSize = 10;
    if(req.body.limit){
        if(!isNaN(req.body.limit)){
            pageSize = parseInt(req.body.limit);
        }
    }

    var query = "SELECT productName as n, version as v, overallRate as o, lastUpdate as d, GROUP_CONCAT(t.tag) as tags " +
        " FROM products p" +
        " LEFT JOIN productTags pt" +
        " ON p.productId = pt.productId" +
        " LEFT JOIN tags t" +
        " ON pt.tagId = t.tagId";

    if(name) {
        query += " WHERE productName LIKE " + name;
    }
    query += " GROUP BY p.productId";

    if(tags) {
        query += " HAVING tags LIKE " + tags.shift();
        var i = 0, total = tags.length;
        for(i; i < tags.length; i++) {
            query += " AND tags LIKE " + tags.shift();
        }
    }

    query +=  " LIMIT " + pageSize;
    if(page > 1){
        query += " OFFSET " + (page-1) * pageSize;
    }

    query += ";";

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    req.db.query(query, function(err, rows) {
        if(err){
            next(err); // throw err;
        } else {

            rows = rows.map(function (v) {
                if (v.d) {
                    var date = new Date(v.d);
                    v.d = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                }

                if (v.tags)
                    v.tags = v.tags.split(',');
                else
                    v.tags = [];
                return v;
            });
            res.json({posts: rows, page: page, name: req.body.name, limit: pageSize});
        }

    });
});

router.get('/search', function(req,res,next) {
    var query = "SELECT tag FROM tags";

    req.db.query(query, function(err, rows) {
        if (err) {
            next(err); // throw err;
        } else {
            rows = rows.map(function(v) {
               return v.tag;
            });
            res.render('search', {posts:[],allTags:rows});
        }
    });

});

module.exports = router;
