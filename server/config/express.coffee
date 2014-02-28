
'use strict'

express = require 'express'
env = require __dirname + '/env'

app = express()

app.configure ->
  app.set 'host', env.host
  app.set 'views', __dirname + '/../views'
  app.set 'view engine', 'jade'
  app.set 'view options', { layout: false }
  app.use express.compress()
  app.use express.json()
  app.use express.urlencoded()
  app.use express.methodOverride()
  app.use express.cookieParser()
  app.use app.router

app.configure 'development', ->
  app.set 'port', env.server.ports.dev
  app.use express.logger()
  app.use express.errorHandler { dumpExceptions: true, showStack: true }
  app.use express.static env.staticPaths.dev

app.configure 'production', ->
  app.set 'port', env.server.ports.pro
  app.use express.errorHandler()
  app.use express.static env.staticPaths.pro

module.exports = app
