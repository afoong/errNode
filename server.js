PORT = 8024;
DBPORT = 27017;

//HOST = 'localhost';
HOST = 'li21-127.members.linode.com';

var sys = require('sys'),
http = require('http'),
Db = require('mongodb').Db,
Server = require('mongodb').Server,
Connection = require('mongodb').Connection,
BSON = require('mongodb').BSONNative,
db = new Db('errrecorderdb', new Server(HOST, DBPORT, {}), {});

sys.puts("now connecting to " + HOST + " at " + DBPORT);

var count = 0;

function getType(callback) {  
   var e;    
  
  function doSomething() {  
    //console.log(e);
    callback(e);
  }  
db.open(function(err, db) {
   db.collection('errors', function(err, collection) {   
      collection.find({}, {limit:5, sort:[['time', -1]]}, function(err, cursor) {  
        cursor.toArray(function(err, error) {  
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
   getType(function(er){
      sys.puts("the type is "+er.type+"\n");
   });

   //db.open(function(err, db) {
   //   db.collection('errors', function(err, collection) {
   //      collection.count(function(err, c) {
	//        numInto(c); 
	//    
	//         sys.puts("There are " + count + " records in the errors collection");
	//      });
   //   });
   //});
   
	res.write("There are " + count + " records in the errors collection");
	res.end();

}).listen(PORT, HOST);

sys.puts("Server at http://" + HOST + ':' + PORT.toString() + '/');
sys.puts('Hello NodeJS');


