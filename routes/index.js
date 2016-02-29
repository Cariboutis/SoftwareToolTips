var express = require('express');
var paginate = require('express-paginate');
var url = require('url');

var router = express.Router();

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

router.get('/search', function(req,res,next) {
    var parts = url.parse(req.url, true);
    var queryStr = parts.query;

    var p = parseInt(queryStr.page);
    var page = isNaN(p)? 1 : p; // isNaN(undefined) == true
    var name = undefined;
    if(queryStr.name) {
        name = req.db.escape('%' + (queryStr.name || "") + '%');
    }
    var tags = undefined;
    if(queryStr.tags) {
        tags = queryStr.tags.split(",");
        tags = tags.map(function(v) {
           return req.db.escape( '%' + v + '%');
        });
    }
    var pageSize = 4;
    console.log(page);

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
        query += ", " + (page-1) * pageSize;
    }

    query += ";";

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    req.db.query(query, function(err, rows) {
        if(err) throw err;

        rows = rows.map(function(v) {
            if(v.d){
                var date = new Date(v.d);
                v.d = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            }

            if(v.tags)
                v.tags = v.tags.split(',');
            else
                v.tags = [];
            return v;
        });

        res.render('search', {posts:rows, page:page, name:queryStr.name, pageSize:pageSize});
    });
});


module.exports = router;
