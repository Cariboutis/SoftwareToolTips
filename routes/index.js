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
    var name = req.db.escape( '%' + (queryStr.name || "") + '%' );
    var pageSize = 3;
    console.log(page);

    var query = "SELECT productName as n, version as v, overallRate as o, uploadDate as d FROM products";

    if(name != "%%") {
        query += " WHERE productName LIKE " + name;
    }
    query +=  " LIMIT " + pageSize;
    if(page > 1){
        query += ", " + (page-1) * pageSize;
    }

    query += ";";

    req.db.query(query, function(err, rows) {
        if(err) throw err;

        res.render('search', {posts:rows, page:page, name:queryStr.name, pageSize:pageSize});
    });
});


module.exports = router;
