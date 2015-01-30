/*jshint unused:false */

var
  path = require('path'),
  log = require('fedtools-logs'),
  utilities = require('fedtools-utilities'),
  Config;

// -- C O N S T R U C T O R

Config = function () {
  if (Config._instance) {
    return Config._instance;
  }
  Config._instance = this;
  this._initialize();
};

Config.prototype.name = 'config';

// -- P R I V A T E  M E T H O D S

Config.prototype._initialize = function () {
  // Get the .fedtoolsrc file
  this.fedtoolsRcFile = utilities.getFedtoolsRcFile();
  // Some default values are in package.json (config key)
  // so we need to transfer them to the .fedtoolsrc file.
  // If they are already in this file, do not replace them.
};

Config.prototype._parseArguments = function (args) {

};

// -- P U B L I C  M E T H O D S

Config.prototype.init = function (config) {

};

Config.prototype.run = function () {
  var args = Array.prototype.slice.call(arguments);
  console.log(args);
};

Config.prototype.getHelp = function (debug, options) {
  var
    i = 0,
    MAX_OPTIONS = 10,
    namespace,
    _options = [];

  options.i18n.loadPhrases(path.resolve(__dirname, '..', 'data', 'i18n', 'config'));

  namespace = 'config.help';

  if (namespace) {
    for (i = 0; i < MAX_OPTIONS; i += 1) {
      _options.push({
        option: options.i18n.t(namespace + '.options.' + i + '.option'),
        desc: options.i18n.t(namespace + '.options.' + i + '.desc')
      });
    }
    return {
      namespace: namespace,
      synopsis: options.i18n.t(namespace + '.synopsis'),
      command: options.i18n.t(namespace + '.command'),
      description: options.i18n.t(namespace + '.description'),
      options: _options,
      examples: options.i18n.t(namespace + '.examples'),
    };
  }

  return {};
};

// -- E X P O R T S
module.exports = (function () {
  return Config._instance || new Config();
})();
