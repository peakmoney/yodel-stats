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
