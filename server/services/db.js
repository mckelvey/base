(function() {
  'use strict';

  /* jshint -W055 */
  var Db, env,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  env = require(__dirname + '/../config/env');

  Db = (function(_super) {
    __extends(Db, _super);

    function Db(database) {
      var self;
      if (database == null) {
        database = env.redis.database;
      }
      self = this;
      this.client = (require('redis')).createClient(env.redis.port, env.redis.host);
      this.client.on('error', function(err) {
        if (err.toString().match(/ECONNREFUSED/) != null) {
          return console.log(err);
        } else {
          throw err;
        }
      });
      this.client.on('connect', function() {
        return self.select(database);
      });
      this.on('set-success', function(key) {
        return self.exec('sadd', 'global:keys', key);
      });
      this.on('del-success', function(key) {
        return self.exec('srem', 'global:keys', key);
      });
    }

    Db.prototype.exec = function(method, key, value, callback) {
      var args, e, self, wrappedCallback;
      self = this;
      args = [];
      if (typeof key !== 'undefined') {
        args.push(key);
      }
      if (typeof value !== 'undefined') {
        args.push(value);
      }
      wrappedCallback = function(e, reply) {
        if (callback != null) {
          callback(e, reply);
        }
        if (e != null) {
          return self.emit("" + method + "-success", key, value, reply);
        } else {
          return self.emit("" + method + "-failure", key, value, e);
        }
      };
      try {
        return this.client.send_command(method, args, wrappedCallback);
      } catch (_error) {
        e = _error;
        return this.emit('Error', e, {
          method: method,
          key: key,
          value: value,
          callback: callback
        });
      }
    };

    Db.prototype.select = function(database, callback) {
      return this.exec('select', database, void 0, callback);
    };

    Db.prototype.incr = function(key, callback) {
      return this.exec('incr', key, void 0, callback);
    };

    Db.prototype.type = function(key, callback) {
      return this.exec('type', key, void 0, callback);
    };

    Db.prototype.exists = function(key, callback) {
      return this.exec('exists', key, void 0, callback);
    };

    Db.prototype.get = function(key, callback) {
      var self, wrappedCallback;
      self = this;
      wrappedCallback = function(e, reply) {
        var parsed;
        if ((e != null) || reply === null) {
          if (callback != null) {
            return callback(e, reply);
          }
        } else {
          try {
            parsed = JSON.parse(reply);
            if (callback != null) {
              return callback(e, parsed);
            }
          } catch (_error) {
            e = _error;
            self.emit('Error', e, {
              key: key,
              reply: reply,
              callback: callback
            });
            if (callback != null) {
              return callback(e, reply);
            }
          }
        }
      };
      return this.exec('get', key, void 0, wrappedCallback);
    };

    Db.prototype.set = function(key, value, callback) {
      var data, e, self;
      self = this;
      try {
        data = JSON.stringify(value);
      } catch (_error) {
        e = _error;
        self.emit('Error', e, {
          key: key,
          value: value,
          callback: callback
        });
      }
      return this.exec('set', key, data, callback);
    };

    Db.prototype.sadd = function(key, value, callback) {
      return this.exec('sadd', key, value, callback);
    };

    Db.prototype.smembers = function(key, callback) {
      return this.exec('smembers', key, void 0, callback);
    };

    Db.prototype.del = function(key, callback) {
      return this.exec('del', key, void 0, callback);
    };

    Db.prototype.flushdb = function(callback) {
      return this.exec('flushdb', void 0, void 0, callback);
    };

    return Db;

  })((require('events')).EventEmitter);

  module.exports = Db;

}).call(this);
