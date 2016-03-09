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
      if (err) throw err;

      var user = uRows[0];
      var commentQuery = "SELECT commentBody, c.overallRate, p.productName, p.version FROM comments c left join products p on p.productId WHERE c.userId = " + user.userId + " LIMIT 5";
      req.db.query(commentQuery, function (err,cRows) {
        if (err) throw err;

        var comments = cRows;
        res.render('userprofile', {user: user, comments: comments});
      });
    });
  } else {
    next();
  }
});

module.exports = router;
