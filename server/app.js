(function() {
  'use strict';
  var Db, env, express, fs, handlePage, http, item, path, pattern, server, staticItem, _i, _len, _ref;

  http = require('http');

  fs = require('fs');

  path = require('path');

  env = require(__dirname + '/config/env');

  express = require(__dirname + '/config/express');

  server = http.createServer(express);

  Db = require(__dirname + '/services/db');


  /* db = new Db() */


  /* API Responses */

  express.get('/api/', function(req, res) {
    return res.send(404);
  });


  /* Page/Static Responses */

  pattern = [];

  _ref = fs.readdirSync(env.server.staticPath);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    staticItem = _ref[_i];
    item = fs.statSync("" + env.server.staticPath + "/" + staticItem);
    if (item.isDirectory()) {
      staticItem += '/';
    }
    pattern.push(staticItem.replace('.', '\\.').replace('/', '\\/'));
  }

  pattern = new RegExp('^\\/(?!' + pattern.join('|') + ')', '');

  handlePage = function(page, response) {
    return fs.lstat(path.join(__dirname, 'views', 'pages', "" + page + ".jade"), function(err, stats) {
      if (err != null) {
        if (page.substr(-5) !== 'index') {
          return handlePage("" + page + "/index", response);
        } else {
          return response.status(404).render('errors/404', {
            basedir: path.join(__dirname, 'views')
          });
        }
      }
      return response.render("pages/" + page, {
        basedir: path.join(__dirname, 'views')
      });
    });
  };

  express.get(pattern, function(req, res) {
    if (req.url !== '/' && req.url.substr(-1) === '/') {
      return res.redirect(301, req.url.replace(/\/+$/, ''));
    }
    return handlePage(req.url.replace(/\/+$/, ''), res);
  });

  server.listen(env.server.port);

}).call(this);
