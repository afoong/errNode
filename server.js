PORT = 8024;
DBPORT = 27017;

//HOST = 'localhost';
HOST = 'li21-127.members.linode.com';

{ "_id" : ObjectId("4d30c8273f541d6500000020"), "group-id" : ObjectId("4d30c8273f541d650000001f"), "msg" : "/: division by zero", "time" : "1288720506", "type" : "exn:fail:contract:divide-by-zero" }

var sys = require('sys'),
http = require('http'),
Db = require('mongodb').Db,
Server = require('mongodb').Server,
Connection = require('mongodb').Connection,
BSON = require('mongodb').BSONNative,
db = new Db('errrecorderdb', new Server(HOST, DBPORT, {}), {});

sys.puts("now connecting to " + HOST + " at " + DBPORT);

var count = 0;

function getType(callback, res) {  
   var e;    
  
  function doSomething() {  
    //console.log(e);
    callback(e, res);
  }  
db.open(function(err, db) {
   db.collection('errors', function(err, collection) {   
      collection.find({}, {limit:5, sort:[['time', -1]]}, function(err, cursor) {  
        cursor.each(function(err, error) {  
          e = error;  
          doSomething();  
         });  
      });  
   }); 
});

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
   getType(function(er, res){
      if(er) {
         sys.puts("error is ");
         console.log(er['type'] + " -> " + er['msg']);
         sys.puts("\n");
         res.write(er);
      }
   });

   db.open(function(err, db) {
      db.collection('errors', function(err, collection) {
         collection.count(function(err, c) {
	        numInto(c); 
	    
	         sys.puts("There are " + count + " records in the errors collection");
	      });
      });
   });
   
	res.write("There are " + count + " records in the errors collection");
	res.end();

}).listen(PORT, HOST);

sys.puts("Server at http://" + HOST + ':' + PORT.toString() + '/');
sys.puts('Hello NodeJS');


