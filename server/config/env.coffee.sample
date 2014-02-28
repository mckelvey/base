
'use strict'

staticPaths =
  dev: __dirname + '/../../build'
  pro: __dirname + '/../../dist'

ports =
  dev: 3000
  pro: 8000

databases =
  dev: 2
  pro: 1

module.exports =
  env: if process.env['NODE_ENV']? and process.env['NODE_ENV'] is 'production' then 'pro' else 'dev'
  staticPaths: staticPaths
  server:
    staticPath: if process.env['NODE_ENV']? and process.env['NODE_ENV'] is 'production' then staticPaths.pro else staticPaths.dev
    ports: ports
    port: if process.env['NODE_ENV']? and process.env['NODE_ENV'] is 'production' then ports.pro else ports.dev
    host: 'domain.com'
  redis:
    host: '127.0.0.1'
    port: 6379
    database: if process.env['NODE_ENV']? and process.env['NODE_ENV'] is 'production' then databases.pro else databases.dev
