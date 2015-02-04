var common = require('../common');

var HourlyAggregation = module.exports = {};

HourlyAggregation.actions = {
  1: 'create_device'
, 2: 'update_device'
, 3: 'delete_device'
, 4: 'notify'

, 'create_device': 1
, 'update_device': 2
, 'delete_device': 3
, 'notify':        4
};


HourlyAggregation.getDataForAction = function(action, callback) {
  common.knex('hourly_aggregations')
        .where({
          action: HourlyAggregation.actions[action]
        })
        .orderBy('start_time', 'desc')
        .limit(12)
        .exec(callback);
}


HourlyAggregation.track = function(event) {
  var updates = {};
  if (event.platform == 'ios') {
    increment('ios');
  } else if (event.platform == 'android') {
    increment('android');
  }
  increment(event.successful ? 'successful' : 'failed');

  common.knex('hourly_aggregations')
        .update(updates)
        .where({
          action: HourlyAggregation.actions[event.action]
        })
        .orderBy('start_time', 'desc')
        .limit(1)
        .catch(common.notifyError);

  function increment(column) {
    updates[column] = common.knex.raw('`'+column+'` + 1');
  }
}


HourlyAggregation.addColumns = function() {
  common.knex('hourly_aggregations')
    .orderByRaw('start_time DESC')
    .first()
    .then(function(result) {
      var nextStartTime = null;
      if (result) {
        nextStartTime = new Date(result.start_time.getTime() + 60 * 60 * 1000);
        if (nextStartTime > new Date()) { return; }
      } else {
        nextStartTime = new Date();
      }

      nextStartTime.setMinutes(0);
      nextStartTime.setSeconds(0);
      nextStartTime.setMilliseconds(0);

      var values = [];
      while (new Date() > nextStartTime) {
        [1, 2, 3, 4].forEach(function(action) {
          values.push(common.knex.raw("(?, ?)", [action, nextStartTime]));
        });
        nextStartTime = new Date(nextStartTime.getTime() + 60 * 60 * 1000);
      }

      var query = "INSERT IGNORE INTO hourly_aggregations"+
                  " (`action`, `start_time`) VALUES"+values;

      common.knex.raw(query).then(function(results) {
        console.log(results[0].affectedRows + ' rows inserted into hourly_aggregations');
      }).catch(common.notifyError);
    })
    .catch(common.notifyError)
}
