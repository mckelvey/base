
'use strict'

express           = require 'express'
morgan            = require 'morgan'
bodyParser        = require 'body-parser'
cookieParser      = require 'cookie-parser'
methodOverride    = require 'method-override'
compress          = require 'compression'
errorHandler      = require 'errorhandler'

nodeEnv = process.env.NODE_ENV || 'development'
env = require __dirname + '/env'

app = express()
app.set 'host', env.host
app.set 'views', __dirname + '/../views'
app.set 'view engine', 'jade'
app.set 'view options', { layout: false }
app.use (req, res, next) ->
  if req.url.split('/').pop().match(/\.[a-z\d]+$/ig) is null
    res.setHeader 'X-Frame-Options', "DENY"
  next()
app.use compress()
app.use bodyParser.urlencoded({ extended: true })
app.use bodyParser.json()
app.use methodOverride()
app.use cookieParser()
app.use errorHandler()

if nodeEnv is 'development'
  app.set 'port', env.server.ports.dev
  app.use morgan('dev')
  app.use express.static env.staticPaths.dev

if nodeEnv is 'production'
  app.set 'port', env.server.ports.pro
  app.use express.static env.staticPaths.pro

module.exports = app
