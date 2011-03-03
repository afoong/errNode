PORT = 8024;
DBPORT = 27017;

//HOST = 'localhost';
HOST = 'li21-127.members.linode.com';

var sys = require('sys'),
http = require('http'),
Db = require('mongodb').Db,
Server = require('mongodb').Server,
Connection = require('mongodb').Connection,
BSON = require('mongodb').BSONNative;

sys.puts("now connecting to " + HOST + " at " + DBPORT);

var count = 0;
var e;

var getType = function (error) {    
   e = error;
}

var numInto = function (num) {
	count = num;
}

http.createServer(function(req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.write('Hello World\n');

   db = new Db('errrecorderdb', new Server(HOST, DBPORT, {}), {});

   db.open(function(err, thisDb) {
      thisDb.collection('errors', function(err, collection) {
         collection.count(function(err, c) {
	        numInto(c); 
	    
	         sys.puts("There are " + count + " records in the errors collection");
	      });
      });

      thisDb.collection('errors', function(err, collection) {   
         collection.find({}, {limit:5, sort:[['time', -1]]}, function(err, cursor) {  
           cursor.each(function(err, error) {  
             getType(error);

             if(error) {
               console.log(error['type'] + " -> " + error['msg']);
             }
            });  
         });  
      }); 
   });

   
	res.write("There are " + count + " records in the errors collection");
	if(e) {
	   res.write(e['type'] + " -> " + e['msg']);
	}
	res.end();

}).listen(PORT, HOST);

sys.puts("Server at http://" + HOST + ':' + PORT.toString() + '/');
sys.puts('Hello NodeJS');


