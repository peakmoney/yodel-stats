var common        = require('../common')
  , redis         = common.redisSubscriber
  , elasticsearch = common.elasticsearch;

redis.subscribe("yodel:events", function(err, data) {
  if (err) { return common.notifyError(err); }
  redis.on("message", function(channel, data) {
    if (channel == 'yodel:events') {
      var parsedData = JSON.parse(data);
      elasticsearch.create({
        index: 'yodel_events'
      , type: parsedData.action
      , body: {
          user_id: parsedData.user_id
        , platform: parsedData.platform
        , successful: parsedData.successful
        , date: new Date()
        }
      }, function(err) {
        common.notifyError(err);
      });
    }
  });
});
