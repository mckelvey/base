
'use strict'

express           = require 'express'
morgan            = require 'morgan'
bodyParser        = require 'body-parser'
cookieParser      = require 'cookie-parser'
methodOverride    = require 'method-override'
compress          = require 'compression'
errorHandler      = require 'errorhandler'

root              = __dirname + '/../../'
packageJSON       = require("#{root}package.json")


nodeEnv = process.env.NODE_ENV || 'development'

app = express()
app.set 'host', packageJSON.production.domain
app.set 'views', "#{root}#{packageJSON.templatePath}"
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
app.use morgan('dev') if nodeEnv is 'development'
app.set 'port', packageJSON[nodeEnv].port
app.use express.static "#{root}#{packageJSON[nodeEnv].staticPath}"

module.exports = app
