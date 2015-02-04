var express           = require('express')
  , router            = express.Router()
  , HourlyAggregation = require('../models/hourly_aggregation');


router.all('/login', function(req, res, next) {
  res.render('login', { pageName: 'Login' });
});

router.get('/', function(req, res, next) {
  HourlyAggregation.getDataForAction('notify', function(err, aggregations) {
    if (err) { return next(err); }
    res.render('index', { pageName: 'Notifications', aggregations: aggregations });
  });
});


module.exports = router;
