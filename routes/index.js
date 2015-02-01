var express = require('express');
var router = express.Router();


router.all('/login', function(req, res, next) {
  res.render('login', { pageName: 'Login' });
});

router.get('/', function(req, res, next) {
  res.render('index', { pageName: 'Dashboard' });
});


module.exports = router;
