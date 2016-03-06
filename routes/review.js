var express = require('express');
var dateUtils = require('../utils/dateutils');

var router = express.Router();


function isValid(req, pId){
    if(isNaN(req.body.overall) || isNaN(req.body.compatibility) || isNaN(req.body.easeOfUse)
        || isNaN(req.body.documentation) || isNaN(req.body.learnability)
        || (req.body.body == undefined) || (!req.session.isLoggedIn)
        || (req.session.user == undefined) || isNaN(pId)){
        return false;
    } else {
        return true;
    }
}

router.post('/:productId', function(req,res,next) {
    if(req.session.isLoggedIn) {
        var pId = req.params.productId;
        if (isValid(req, pId)) {
            var now = dateUtils.today();
            var values = {
                commentBody: req.body.body,
                overallRate: parseInt(req.body.overall),
                compatibility: parseInt(req.body.compatibility),
                easeOfUse: parseInt(req.body.easeOfUse),
                documentation: parseInt(req.body.documentation),
                learnability: parseInt(req.body.learnability),
                productId: parseInt(pId),
                userId: req.session.user.userId,
                commentTime: now
            };

            // NOTE: This will only work in MySQL
            var insert = "INSERT INTO comments SET ?";

            // NOTE: inserting values this way escapes all non-number values
            req.db.query(insert, values, function (err, rows) {
                if (err) {
                    next(err);
                } else {

                    var commentId = rows.insertId;

                    var query = "SELECT commentBody, commentTime, compatibility, documentation, easeOfUse, learnability, overallRate, commentId FROM comments c WHERE commentId = " + commentId + " ORDER BY commentTime LIMIT 1";

                    req.db.query(query, function (err, rows) {
                        if (err) {
                            next(err);
                        } else {
                            var comment = rows[0];
                            comment.username = req.session.user.username;
                            comment.userId = req.session.user.userId;
                            comment.commentTime = dateUtils.formatDate(comment.commentTime);
                            req.session.commentedOn.push(parseInt(pId));
                            res.json(rows[0]);
                        }
                    });
                }
            });
        } else {
            next("Invalid data submitted");
        }
    } else {
        next("You are not logged in and should not be posting to this page.");
    }
});

router.get('/:productId/comments', function(req,res,next) {

    var pId = req.params.productId;
    var off = req.query.offset;
    if(!isNaN(pId) && (!isNaN(off) || off == undefined )){
        var pageSize = 5;

        var id = parseInt(pId);
        var query = "SELECT commentBody, commentTime, compatibility, documentation, easeOfUse, learnability, overallRate, username, c.userId, commentId FROM comments c INNER JOIN users u ON c.userId = u.userId WHERE productId = " + id + " ORDER BY commentTime DESC LIMIT " + pageSize;
        if(off){
            var offset = parseInt(off);
            query += " OFFSET " + offset;
        }

        req.db.query(query,  function(err, rows) {
            if(err) {
                next(err);
            } else {
                rows.map(function(v){
                    v.commentTime = dateUtils.formatDate(v.commentTime);
                });
                res.json(rows);
            }
        });
    }
});

router.delete('/:commentId', function(req,res,next) {
    if(req.session.isLoggedIn) {
        var commentId = req.params.commentId;

        if(!isNaN(commentId)) {
            var query = "SELECT userId, productId FROM comments WHERE commentId = " + commentId;

            req.db.query(query, function(err, rows) {
                if(err) {
                    next(err);
                } else {
                    var com = rows[0];
                    if(com.userId == req.session.user.userId){
                        var query = "DELETE FROM comments WHERE commentId = " + commentId;
                        req.db.query(query, function(err, rows) {
                           if(err){
                               res.json({success:false,err:err});
                           } else {
                               if(req.session.commentedOn){
                                   var index = req.session.commentedOn.indexOf(com.productId);
                                   if(index > -1){
                                       req.session.commentedOn.splice(index,1);
                                   }

                               }
                               res.json({success:true,err:null});
                           }

                        });
                    } else {
                        res.json({success:false,err:"You are not allowed to delete this review."});
                    }
                }
            })
        } else {
            res.json({success:false,err:"Review ID is not a number."});
        }

    } else {
        res.json({success:false,err:"Why are you posting a delete when not logged in?"});
    }
});


module.exports = router;