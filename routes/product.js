var url = require('url');
var mysql = require('mysql');
var express = require('express');
var dateUtils = require('../utils/dateutils');
var utils = require('../utils/utils');

var router = express.Router();

router.get('/', function(req,res,next) {
    res.render('product');
});



router.get('/New', function(req,res,next) {
    if (!req.session.isLoggedIn) {
        req.session.lastPage = "/product/new";
        res.redirect('/Login');//, { message : "You need to be logged in to create a new product." });
    } else {
        var now = dateUtils.today();
        res.render('newProduct', { today: now});
    }
});

router.post('/new', function (req, res, next) {
    if(req.session.isLoggedIn) {
        // TODO: Allow uploads rather than just links

        var productName = req.body.productName;
        var logoUrl = req.body.logoUrl;
        var versionNum = req.body.versionNum;
        var lastUpdate = req.body.lastUpdate;
        var description = req.body.description;
        var now = new Date();//dateUtils.today();
        var tags = req.body.tags.split(",");

        if(lastUpdate && lastUpdate != "") {
            var d = new Date(lastUpdate);
            lastUpdate = d.getFullYear() + "-" + dateUtils.dateAddLeadingZero(d.getMonth() + 1) + "-" + dateUtils.dateAddLeadingZero(d.getDate());
        } else {
            lastUpdate = null;
        }

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
        req.db.query(insert, values, function (err, rows) {
            if (err) {
                next(err);
            } else {
                var productId = rows.insertId;
                if (tags.length < 1) return;

                var insertTags = "INSERT IGNORE INTO tags (tag) VALUES ";
                for (var i = 0; i < tags.length - 1; ++i) {
                    insertTags += "(" + req.db.escape(tags[i]) + "),";
                }

                insertTags += "(" + req.db.escape(tags[tags.length - 1]) + ")";

                console.log("Inserting: " + mysql.format(insertTags, [tags]));

                req.db.query(insertTags, function (err, rows) {
                    if (err) {
                        next(err);
                    } else {
                        var insertProductTags = "INSERT INTO productTags VALUES";

                        for (var i = 0; i < tags.length - 1; ++i) {
                            insertProductTags += "(" + req.db.escape(productId) + ", (SELECT tagId FROM tags where tag=" + req.db.escape(tags[i]) + ")),";
                        }

                        insertProductTags += "(" + req.db.escape(productId) + ", (SELECT tagId FROM tags where tag=" + req.db.escape(tags[tags.length - 1]) + "))";

                        req.db.query(insertProductTags, function (err, rows) {
                            if (err) {
                                next(err);
                            } else {
                                res.redirect('/product/' + productName + '/' + versionNum);
                            }
                        })
                    }
                })
            }
        });
    } else {
        next("Why are you posting to this page?");
    }
});

router.get('/:pname', function(req,res,next) {
    req.session.lastPage = '/product/' + req.params.pname;

    var productName = req.db.escape(req.params.pname);

    var selectPQ = "SELECT version, lastUpdate, overallRate, GROUP_CONCAT(t.tag) as tags " +
        " FROM products p" +
        " LEFT JOIN productTags pt" +
        " ON p.productId = pt.productId" +
        " LEFT JOIN tags t" +
        " ON pt.tagId = t.tagId" +
        " WHERE productName = " + productName +
        " GROUP BY p.productId";

    req.db.query(selectPQ,  function(err, rows) {
        if(err){
            next(err);
        } else {

            rows.map(function(param) {
                if(param.lastUpdate && !param.lastUpdate == "0000-00-00") {
                    param.lastUpdate = dateUtils.formatDate(param.lastUpdate);
                } else {
                    param.lastUpdate = "Unknown";
                }
                param.overallRate = param.overallRate.toFixed(1) || "No Rating";
                if(param.tags) {
                    param.tags = param.tags.split(',');
                }
                return param;
            });

            res.render('productList',{products:rows, name: req.params.pname});
        }
    });

});

router.get('/:pname/stats', function(req,res,next) {

    req.session.lastPage = '/product/' + req.params.pname + '/stats';

    var version = url.parse(req.url, true).query.version || "";
    var pname = req.db.escape(req.params.pname);

    var query = "SELECT version FROM products WHERE productName = " + pname;

    req.db.query(query, function(err, rows) {
        if(err) {
            next(err);
        } else {
            if (rows.length == 0) {
                next();
            } else {
                var versions = rows.map(function (v) {
                    return v.version;
                });
                res.render('stats', {
                    productName: req.params.pname,
                    versions: versions,
                    selectedVersion: version,
                    server: req.server
                });
            }
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

    req.session.lastPage = '/product/' + req.params.pname + "/" + req.params.vnum;

    var pname =  req.db.escape(req.params.pname);
    var vnum = req.db.escape(req.params.vnum);

    var query = "SELECT totalReviews, productName, description, version, overallRate, documentation, compatibility, easeOfUse, learnability, logoUrl, p.productId, uploadDate, userId, lastUpdate, GROUP_CONCAT(t.tag) as tags " +
    " FROM products p" +
    " LEFT JOIN productTags pt" +
    " ON p.productId = pt.productId" +
    " LEFT JOIN tags t" +
    " ON pt.tagId = t.tagId" +
    " WHERE productName = " + pname +
    " AND version = " + vnum +
    " GROUP BY p.productId";

    var productQuery = req.db.query(query,  function(err, rows) {
        if(err) {
            next(err);
        }else {
            if (rows.length == 0) {
                next();
            } else {

                var product = rows[0];
                var hasCommented = false;
                if (req.session.isLoggedIn) {
                    if (req.session.commentedOn) {
                        hasCommented = (req.session.commentedOn.indexOf(product.productId) > -1);
                        res.render('product', {product: product, hasCommented: hasCommented});
                    } else {
                        //Add all product IDs the user has commented on to session.
                        var select = "SELECT productId FROM comments WHERE userId = " + req.session.user.userId;
                        req.db.query(select, function (err, rows) {
                            if (!err) {
                                req.session.commentedOn = rows.map(function (v) {
                                    return v.productId;
                                });
                                hasCommented = (req.session.commentedOn.indexOf(product.productId) > -1);
                                res.render('product', {product: product, hasCommented: hasCommented});
                            } else {
                                res.statusCode = 500;
                                next(err);
                            }
                        });
                    }
                } else {
                    res.render('product', {product: product, hasCommented: hasCommented});
                }
            }
        }
    });
});

router.get('/:pname/:vnum/ratings', function(req,res,next) {
    var pname =  req.db.escape(req.params.pname);
    var vnum = req.db.escape(req.params.vnum);
    var query = "SELECT totalReviews, overallRate, documentation, compatibility, easeOfUse, learnability FROM products WHERE productName = " + pname + " AND version = " + vnum;

    req.db.query(query, function(err,rows) {
       if(err){
           res.json({success:false,err:err.message});
       } else {
           var p = rows[0];
           res.json({success:true,product:p});
       }
    });
});

router.get('/:pname/:vnum/edit', function(req,res,next) {
    req.session.lastPage = "/product/" + req.params.pname + "/" + req.params.vnum + "/edit";
    if(req.session.isLoggedIn){
        var pname =  req.db.escape(req.params.pname);
        var vnum = req.db.escape(req.params.vnum);

        var query = "SELECT productName, description, version, overallRate, documentation, compatibility, easeOfUse, learnability, logoUrl, p.productId, uploadDate, userId, lastUpdate, GROUP_CONCAT(t.tag) as tags " +
            " FROM products p" +
            " LEFT JOIN productTags pt" +
            " ON p.productId = pt.productId" +
            " LEFT JOIN tags t" +
            " ON pt.tagId = t.tagId" +
            " WHERE productName = " + pname +
            " AND version = " + vnum +
            " GROUP BY p.productId";

        var productQuery = req.db.query(query,  function(err, rows) {
            if (err) {
                next(err);
            } else {
                var p = rows[0];
                if(p.userId != req.session.user.userId){
                    next("You do not have permissions to edit this product.");
                } else {
                    if(!p.lastUpdate || p.lastUpdate == "0000-00-00") p.lastUpdate = "";
                    res.render('editProduct', {product:p});
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/:pname/:vnum/edit', function (req, res, next) {

    if(req.session.isLoggedIn) {

        var pId = req.body.productId;

        if(!isNaN(pId)) {

            var productName = req.params.pname;
            var versionNum = req.params.vnum;
            var logoUrl = req.body.logoUrl;
            var lastUpdate = req.body.lastUpdate;
            var description = req.body.description;
            var tags = req.body.tags.split(",");

            var d = new Date(lastUpdate);
            lastUpdate = "'" + d.getFullYear() + "-" + dateUtils.dateAddLeadingZero(d.getMonth() + 1) + "-" + dateUtils.dateAddLeadingZero(d.getDate()) + "'";

            var values = {
                logoUrl: logoUrl,
                lastUpdate: lastUpdate,
                description: description
            };

            var insert = "UPDATE products SET ? WHERE productId = " + pId;

            req.db.query(insert, values, function (err, rows) {
                if (err) {
                    next(err);
                } else {
                    var productId = rows.insertId;

                    if (tags.length < 1) return;

                    var insertTags = "INSERT IGNORE INTO tags (tag) VALUES ";
                    for (var i = 0; i < tags.length - 1; ++i) {
                        insertTags += "(" + req.db.escape(tags[i]) + "),";
                    }

                    insertTags += "(" + req.db.escape(tags[tags.length - 1]) + ")";

                    req.db.query(insertTags, function (err, rows) {
                        if (err) {
                            next(err);
                        } else {
                            var insertProductTags = "INSERT IGNORE INTO productTags VALUES";

                            for (var i = 0; i < tags.length - 1; ++i) {
                                insertProductTags += "(" + pId + ", (SELECT tagId FROM tags where tag=" + req.db.escape(tags[i]) + ")),";
                            }

                            insertProductTags += "(" + pId + ", (SELECT tagId FROM tags where tag=" + req.db.escape(tags[tags.length - 1]) + "))";

                            console.log(insertProductTags);

                            req.db.query(insertProductTags, function (err, rows) {
                                if (err) {
                                    next(err);
                                } else {
                                    var deleteProductTags = "DELETE FROM productTags WHERE productId = " + pId + " AND tagId NOT IN (SELECT tagId FROM tags WHERE tag IN (" + tags.map(function(v) {
                                            return req.db.escape(v);
                                        }).reduce(function(p,c,i,a) {
                                                return p + ',' + c;
                                        }) + "))";

                                    req.db.query(deleteProductTags, function (err, rows) {
                                        if (err) {
                                            next(err);
                                        } else {
                                            res.redirect('/product/' + productName + '/' + versionNum);
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
            });
        } else {
            next("Product ID is not a number");
        }
    } else {
        next("Why are you posting to this page?");
    }
});

router.delete('/:pname/:vnum', function (req, res, next) {

    if (req.session.isLoggedIn) {
        var productName = req.params.pname;
        var version = req.params.vnum;

        var query = "SELECT * FROM products WHERE productName = " + req.db.escape(productName) + " AND version = " + req.db.escape(version);

        req.db.query(query, function(err,rows) {
            if(err) {
                res.json({success:false,err:err.message});
            } else {
                var prod = rows[0];
                if(prod.userId != req.session.user.userId){
                    res.json({success:false,err:"You do not have permissions to delete this product."});
                } else {
                    var deleteQuery = "DELETE FROM products WHERE productName = " + req.db.escape(productName) + " AND version = " + req.db.escape(version);
                    req.db.query(deleteQuery,function(err,rows) {
                        if (err) {
                            res.json({success: false, err: err.message});
                        } else {
                            res.json({success:true,err:null});
                        }
                    });
                }
            }
        })
    } else {
        res.json({success:false,err:"You are not logged in."});
    }
});


module.exports = router;


