var common            = require('../common')
  , redis             = common.redisSubscriber
  , HourlyAggregation = require('../models/hourly_aggregation');

redis.subscribe("yodel:events", function(err, data) {
  if (err) { return common.notifyError(err); }
  redis.on("message", function(channel, data) {
    if (channel == 'yodel:events') {
      HourlyAggregation.track(JSON.parse(date));
    }
  });
});
