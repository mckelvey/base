(function() {
  'use strict';
  var app, env, express;

  express = require('express');

  env = require(__dirname + '/env');

  app = express();

  app.configure(function() {
    app.set('host', env.host);
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'jade');
    app.set('view options', {
      layout: false
    });
    app.use(express.compress());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    return app.use(app.router);
  });

  app.configure('development', function() {
    app.set('port', env.server.ports.dev);
    app.use(express.logger());
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return app.use(express["static"](env.staticPaths.dev));
  });

  app.configure('production', function() {
    app.set('port', env.server.ports.pro);
    app.use(express.errorHandler());
    return app.use(express["static"](env.staticPaths.pro));
  });

  module.exports = app;

}).call(this);
