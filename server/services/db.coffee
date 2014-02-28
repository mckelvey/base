
'use strict'
### jshint -W055 ###

env = require __dirname + '/../config/env'

class Db extends (require 'events').EventEmitter

  constructor: (database=env.redis.database) ->
    self = @
    @client = (require 'redis').createClient env.redis.port, env.redis.host
    @client.on 'error', (err) ->
      if err.toString().match(/ECONNREFUSED/)?
        console.log err
      else
        throw err
    @client.on 'connect', () ->
      self.select database
    @on 'set-success', (key) ->
      self.exec 'sadd', 'global:keys', key
    @on 'del-success', (key) ->
      self.exec 'srem', 'global:keys', key

  exec: (method, key, value, callback) ->
    self = @
    args = []
    args.push(key) if typeof key isnt 'undefined'
    args.push(value) if typeof value isnt 'undefined'
    wrappedCallback = (e, reply) ->
      callback(e, reply) if callback?
      if e?
        self.emit "#{method}-success", key, value, reply
      else
        self.emit "#{method}-failure", key, value, e
    try
      @client.send_command method, args, wrappedCallback
    catch e
      @emit 'Error', e, {
        method: method
        key: key
        value: value
        callback: callback
      }

  select: (database, callback) ->
    @exec 'select', database, undefined, callback

  incr: (key, callback) ->
    @exec 'incr', key, undefined, callback

  type: (key, callback) ->
    @exec 'type', key, undefined, callback

  exists: (key, callback) ->
    @exec 'exists', key, undefined, callback

  get: (key, callback) ->
    self = @
    wrappedCallback = (e, reply) ->
      if e? or reply is null
        callback(e, reply) if callback?
      else
        try
          parsed = JSON.parse(reply)
          callback(e, parsed) if callback?
        catch e
          self.emit 'Error', e, {
            key: key
            reply: reply
            callback: callback
          }
          callback(e, reply) if callback?
    @exec 'get', key, undefined, wrappedCallback

  set: (key, value, callback) ->
    self = @
    try
      data = JSON.stringify(value)
    catch e
      self.emit 'Error', e, {
        key: key
        value: value
        callback: callback
      }
    @exec 'set', key, data, callback

  sadd: (key, value, callback) ->
    @exec 'sadd', key, value, callback

  smembers: (key, callback) ->
    @exec 'smembers', key, undefined, callback

  del: (key, callback) ->
    @exec 'del', key, undefined, callback

  flushdb: (callback) ->
    @exec 'flushdb', undefined, undefined, callback


module.exports = Db
