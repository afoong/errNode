/**
 * Constants
 */
PORT = 8024;
DBPORT = 27017;
HOST = 'localhost';
NUMQUERIES = 3;
PROD_URL = 'li21-127.members.linode.com';

/**
 * Module dependencies.
 */

var express = require('express'),
   sys = require('sys'),
   http = require('http'),
   mongo = require('mongodb');
   Db = mongo.Db,
   Server = mongo.Server,
   Connection = mongo.Connection,
   BSON = mongo.BSONPure;

app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.favicon(__dirname + '/public/favicon.ico'))
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  // HOST default to localhost
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  HOST = PROD_URL;
});

require(__dirname + '/controllers/indexController');

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(PORT);
  console.log("Express server listening on port %d AND %s", app.address().port, HOST);
}

