var express       = require('express')
  , router        = express.Router()
  , Promise       = require('bluebird')
  , common        = require('../common')
  , elasticsearch = common.elasticsearch;


router.all('/login', function(req, res, next) {
  res.render('login', { pageName: 'Login' });
});

router.get('/', function(req, res, next) {
  Promise.join(
    query('create_device')
  , query('update_device')
  , query('delete_device')
  , query('notify')
  , function(devicesCreated, devicesUpdated, devicesDeleted, notifications) {
    res.render('index', { pageName: 'Dashboard' });
  }).catch(common.renderError);


  function query(type) {
    return elasticsearch.search({
      index: 'yodel_events'
    , type: type
    , body: {
        aggs: {
          events_over_time: {
            date_histogram: {
              "field" : "date",
              "interval" : "1m"
            }
          , aggs: {
              success: {
                terms: {field: 'successful'}
              }
            , platform: {
                terms: {field: 'platform'}
              }
            }
          }
        }
      }
    }).then(function(result) {
      var buckets = result['aggregations']['events_over_time']['buckets']
      if (buckets.length < 1) { return buckets; }

      var resultTime        = buckets[0].key
        , currentTime       = new Date().getTime()
        , i                 = 0
        , normalizedBuckets = [];

      while (currentTime > resultTime) {
        var normalizedBucket = {
          time: resultTime
        , total: 0
        , successful: 0
        , failed: 0
        , ios: 0
        , android: 0
        };
        if (buckets[i] && buckets[i].key == resultTime) {
          normalizedBucket['total'] = buckets[i].doc_count;
          if (buckets[i]['success'] && buckets[i]['success']['buckets']) {
            buckets[i]['success']['buckets'].forEach(function(bucket) {
              if (bucket.key == 'T') {
                normalizedBucket.successful = bucket.doc_count;
              } else if (bucket.key == 'F') {
                normalizedBucket.failed = bucket.doc_count;
              }
            });
          }
          if (buckets[i]['platform'] && buckets[i]['platform']['buckets']) {
            buckets[i]['platform']['buckets'].forEach(function(bucket) {
              if (bucket.key == 'ios') {
                normalizedBucket.ios = bucket.doc_count;
              } else if (bucket.key == 'android') {
                normalizedBucket.android = bucket.doc_count;
              }
            });
          }
          i++;
        }
        normalizedBuckets.push(normalizedBucket);
        resultTime += 60 * 1000;
      }
      return normalizedBuckets;
    });
  }
});


module.exports = router;
