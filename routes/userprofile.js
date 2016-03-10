var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('userprofile', { title: 'User Profile' });
});

router.get('/:uid', function(req,res,next) {
  if (!isNaN(req.params.uid)) {
    var uid = req.params.uid;
    var userQuery = "SELECT * FROM users WHERE userId = " + uid;
    req.db.query(userQuery, function(err, uRows) {
      if (err) {
        next(err);
      } else {
        if(uRows.length == 0){
            next({status:400,message:"No User Found"});
        } else {
            var user = uRows[0];
            var commentQuery = "SELECT commentBody, c.overallRate, p.productName, p.version FROM comments c LEFT JOIN products p on p.productId = c.productId WHERE c.userId = " + user.userId + " LIMIT 5";
            req.db.query(commentQuery, function (err, cRows) {
                if (err) {
                    next(err);
                } else {

                    var comments = cRows;
                    res.render('userprofile', {user: user, comments: comments});
                }
            });
        }
      }
    });
  } else {
    next();
  }
});

module.exports = router;
