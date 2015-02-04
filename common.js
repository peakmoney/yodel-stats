var common      = module.exports = {}
  , configCache = {}
  , env         = process.env.NODE_ENV || 'development';

var config = common.config = function config(name, allowBlank) {
  if (typeof configCache[name] !== 'undefined') { return configCache[name]; }

  try {
    var conf = require('./config/'+name);
  } catch (e) {
    if (allowBlank) { return configCache[name] = null; }
    throw e;
  }

  conf = conf[env];
  if (!conf) {
    if (allowBlank) {
      console.error(name+" config not specified for "+env+" environment");
      return configCache[name] = null;
    }
    throw new Error(env+" enviroment not specified for config/"+name);
  }

  return configCache[name] = conf;
};


common.knex = require('knex')(config('knexfile'));

common.redisSession = newRedisClient('redis_session');
common.redisSubscriber = newRedisClient('redis_subscriber');


common.renderError = function(res) {
  return function(err) {
    res.render('error', {pageName: 'Error'});
    common.notifyError(err);
  }
}

common.notifyError = function(err) {
  console.error(err);
};

if (config('sentry', true)) {
  var raven = require('raven');
  var ravenClient = new raven.Client(config('sentry').dsn);
  ravenClient.patchGlobal();
  common.notifyError = function(err, callback) {
    if (!(err instanceof Error)) { err = new Error(err); }
    ravenClient.captureError(err, callback);
  }
}

function newRedisClient(configName) {
  var rConfig = config(configName, true) || {};
  rConfig.port = rConfig.port || 6379;
  rConfig.host = rConfig.host || '127.0.0.1';

  // Don't want to overwrite any data in a database for another env
  if (env == 'test' && typeof rConfig.database === 'undefined') {
    rConfig.database = 5;
  }

  var client = require("redis").createClient(
    rConfig.port, rConfig.host, rConfig.options);

  if (!isNaN(rConfig.database)) { client.select(rConfig.database); }

  return client;
}
