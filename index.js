/*jshint unused:true */

var
  _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  events = require('events'),
  util = require('util'),

  i18n = require('fedtools-i18n'),
  log = require('fedtools-logs'),
  Config;

// -- C O N S T R U C T O R

Config = function () {
  if (Config._instance) {
    return Config._instance;
  }
  Config._instance = this;

  // call event superclass constructor
  events.EventEmitter.call(this);

  // Define public properties
  Object.defineProperty(this, 'FEDTOOLSRCKEYS', {
    value: {
      cloneorlocal: 'cloneorlocal',
      username: 'username',
      useremail: 'useremail',
      userbranch: 'userbranch',
      yuibranch: 'yuibranch',
      warbuilder: 'warbuilder',
      localrepo: 'localrepo',
      browser: 'browser',
      version: 'version',
      mocha1: 'mocha1',
      mocha2: 'mocha2',
      mocha3: 'mocha3',
      jenkinshostname: 'jenkinshostname',
      jenkinsusername: 'jenkinsusername',
      defaultbranch: 'defaultbranch',
      wria2giturl: 'wria2giturl',
      wria2yui3giturl: 'wria2yui3giturl',
      wria2gitfolder: 'wria2gitfolder',
      jspartifactsfolder: 'jspartifactsfolder',
      jsprepofolder: 'jsprepofolder'
    },
    writable: false
  });

  this._initialize();
};

util.inherits(Config, events.EventEmitter);
Config.prototype.name = 'config';

// -- P R I V A T E  M E T H O D S

Config.prototype._getHomeDir = function () {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
};

Config.prototype._initialize = function () {
  i18n.loadPhrases(path.resolve(__dirname, 'data', 'i18n', 'config'));

  this.verbose = false;

  if (!this._fedtoolsEnvRcFile) {
    this._fedtoolsEnvRcFile = path.join(this._getHomeDir(), '.fedtoolsrc');
    if (!fs.existsSync(this._fedtoolsEnvRcFile)) {
      fs.writeFileSync(this._fedtoolsEnvRcFile, '{}');
    }
  }

  this._blacklist = [
    'defaultGitlabId',
    this.FEDTOOLSRCKEYS.warbuilder,
    this.FEDTOOLSRCKEYS.version
  ];

  this._bindEvents();
};

Config.prototype._bindEvents = function () {
  this.on('config:set', this._setChange);
  this.on('config:delete', this._deleteChange);
  this.on('config:reset', this._resetChange);
};

Config.prototype._setChange = function (key, value) {
  if (key && value) {
    log.echo();
    log.success(i18n.t('messages.set', {
      key: key,
      value: value
    }));
    log.echo();
  }
};

Config.prototype._deleteChange = function (key) {
  if (key) {
    log.echo();
    log.success(i18n.t('messages.delete', {
      key: key
    }));
    log.echo();
  }
};

Config.prototype._resetChange = function () {
  log.echo();
  log.success(i18n.t('messages.reset'));
  log.echo();
};

Config.prototype._printUsage = function () {
  log.echo();
  log.echo(i18n.t('usage.intro'));
  log.echo(i18n.t('usage.description'));
  log.echo();
};

Config.prototype._parseArguments = function (args) {
  var
    commands = {
      'l': this.list,
      'ls': this.list,
      'list': this.list,
      'set': this.setKey,
      'rm': this.deleteKey,
      'remove': this.deleteKey,
      'delete': this.deleteKey,
      'reset': this.reset
    };

  if (args[0] && args[0]._ && !_.isEmpty(args[0]._)) {
    // args[0]._[0] === 'config' all the time
    // args[0]._[1] === 'undefined or l|ls|list|set|rm|remove|del|delete'
    // args[0]._[2] === undefined or key_name
    if (_.has(commands, args[0]._[1])) {
      _.bind(commands[args[0]._[1]], this,
        args[0]._[2], args[0]._[3], true)();
    } else {
      this._printUsage();
    }
  }
};

Config.prototype._setKey = function (json, key, value, privateKey) {
  var update = false;
  if ((_.indexOf(this._blacklist, key) < 0) ||
    (_.indexOf(this._blacklist, key) >= 0 && privateKey === true)) {
    json[key.toLowerCase()] = value;
    update = true;
  }
  return {
    update: update,
    json: json
  };
};

Config.prototype._readConfigurationFile = function () {
  var json = {};
  try {
    json = JSON.parse(fs.readFileSync(this._fedtoolsEnvRcFile, 'utf8'));
  } catch(e) {
    log.echo();
    log.fatal(i18n.t('messages.error.unableToRead'));
    log.echo(i18n.t('messages.error.suggestion'));
    log.echo();
    process.exit(0);
  }
  return json;
};

// -- P U B L I C  M E T H O D S

/**
 * Method to be called by each module that need to add
 * anything from package.json config object to the
 * user configuration file (~/.fedtoolrc).
 * It will ignore anything that is in the _blacklist.
 *
 * @method init
 * @param  {Object} pkgConfig package.json config object
 */
Config.prototype.init = function (pkgConfig) {
  // Some default values are in package.json (config key)
  // so we need to transfer them to the .fedtoolsrc file.
  // If they are already in this file, do not replace them.
  var
    json = {},
    keys;

  if (pkgConfig) {
    this._pkgConfig = pkgConfig;
    json = this._readConfigurationFile();
    keys = _.omit(pkgConfig, _.union(this._blacklist, _.keys(json)));
    this.setKey(keys);
  }

};

/**
 * Reset keys to their default values found in the
 * package.json file.
 *
 * @method reset
 */
Config.prototype.reset = function () {
  var
    json = {},
    keys;

  if (this._pkgConfig) {
    json = this._readConfigurationFile();
    keys = _.omit(this._pkgConfig, this._blacklist);
    this.setKey(keys);
    if (this.verbose) {
      this.emit('config:reset');
    }
  }
};

/**
 * Print all the keys available in the ~/.fedtoolsrc file
 *
 * @method list
 */
Config.prototype.list = function () {
  var
    keys,
    len,
    maxLen,
    json = _.omit(this._readConfigurationFile(), this._blacklist);

  keys = _.keys(json).sort();
  maxLen = _.max(keys, function (key) {
    return key.length;
  }).length + 3;

  log.echo();
  _.each(keys, function (key) {
    len = key.length;
    log.echo(' ' + key + ' ' + new Array(maxLen - len).join('.') + ' ' + json[key]);
  });
  log.echo();
};

/**
 * Set a key or a list of keys in the ~/.fedtoolsrc file.
 *
 * @method setKey
 * @param {String} key            The key to save.
 * @param {String} value          The value of the key to save.
 * @param {Boolean} [privateKey]  Needs to be true if the key is
 *                                blacklisted in order to actually
 *                                save it.
 *
 * Alternatively, key can be an object so that multiple keys can
 * be saved in one pass. Multiple keys saving doesn't work for
 * blacklisted keys (they need to be save individually).
 */
Config.prototype.setKey = function (key, value, privateKey) {
  log.debug('==> set: [%s] [%s] [%s]', key, value, privateKey);
  var
    res,
    update = false,
    json = {};

  json = this._readConfigurationFile();

  if (!_.isString(key)) {
    // multiple keys to update at once!
    _.each(key, function (v, k) {
      res = this._setKey(json, k, v);
      if (res.update) {
        update = true;
        json = res.json;
      }
    }, this);
  } else {
    res = this._setKey(json, key, value, privateKey);
    if (res.update) {
      update = true;
      json = res.json;
    }
  }

  if (update) {
    fs.writeFileSync(this._fedtoolsEnvRcFile, JSON.stringify(json, null, 2));
    if (this.verbose) {
      this.emit('config:set', key, value);
    }
  }
};

/**
 * Retrieve the value associated to a key from the ~/.fedtoolsrc file.
 *
 * @method getKey
 * @param  {String} key The key to retrieve.
 * @return {String}     The value of the key if found, undefined
 *                      otherwise.
 */
Config.prototype.getKey = function (key) {
  var json = {};
  if (_.has(this.FEDTOOLSRCKEYS, key)) {
    json = this._readConfigurationFile();
    return json[key];
  }
};

/**
 * Remove a key from the ~/.fedtoolsrc file
 *
 * @method deleteKey
 * @param  {String}  key          The key to delete
 * @param  {Boolean} [privateKey] Needs to be true if the key is
 *                                blacklisted in order to actually
 *                                save it.
 */
Config.prototype.deleteKey = function (key, privateKey) {
  log.debug('==> set: [%s] [%s] [%s]', key, privateKey);
  var json = {};
  if (_.has(this.FEDTOOLSRCKEYS, key)) {
    if ((_.indexOf(this._blacklist, key) < 0) ||
      (_.indexOf(this._blacklist, key) >= 0 && privateKey === true)) {
      json = _.omit(this._readConfigurationFile(), key);
      fs.writeFileSync(this._fedtoolsEnvRcFile, JSON.stringify(json, null, 2));
      if (this.verbose) {
        this.emit('config:delete', key);
      }
    }
  }
};

/**
 * Entry point for the CLI for 'fedtools config'
 */
Config.prototype.run = function () {
  this._parseArguments(Array.prototype.slice.call(arguments));
};

Config.prototype.getHelp = function (debug, options) {
  var
    i = 0,
    MAX_OPTIONS = 10,
    namespace,
    _options = [];

  options.i18n.loadPhrases(path.resolve(__dirname, 'data', 'i18n', 'config'));

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
