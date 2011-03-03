PORT = 8024;
DBPORT = 27017;

HOST = 'localhost';
//HOST = 'li21-127.members.linode.com';

var sys = require('sys'),
http = require('http'),
Db = require('mongodb').Db,
Server = require('mongodb').Server,
Connection = require('mongodb').Connection,
BSON = require('mongodb').BSONNative;

sys.puts("now connecting to " + HOST + " at " + DBPORT);

var count = 0;

var numInto = function (num) {
	count = num;
}

var db = new Db('errrecorderdb', new Server(HOST, DBPORT, {}), {});

var x = function() {
   db.open(function(err, db) {
      db.collection('errors', function(err, collection) {
         collection.count(function(err, c) {
	    numInto(c); 
	    
	    sys.puts("There are " + count + " records in the errors collection");
	    // but res doesnt exist in this function.. what to do?
	   });
      });
   });
}

x();

http.createServer(function(req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.write('Hello World\n');

   x();

	res.write("There are " + count + " records in the errors collection");
	res.end();

}).listen(PORT, HOST);

sys.puts("Server at http://" + HOST + ':' + PORT.toString() + '/');
sys.puts('Hello NodeJS');


