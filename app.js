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

var app = module.exports = express.createServer();

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

// More Vars n Stuff

var count = 0;
var e;

var errCountCount = 0, groupCount = 0, groupIDCount = 0;


var months = new Array(12);
months[0] = "January";
months[1] = "February";
months[2] = "March";
months[3] = "April";
months[4] = "May";
months[5] = "June";
months[6] = "July";
months[7] = "August";
months[8] = "September";
months[9] = "October";
months[10] = "November";
months[11] = "December";

var getMonthName = function(m) {
   return months[m];
}

var sumCounts = function() {
   return errCountCount + groupCount + groupIDCount;
}

var resetCounts = function() {
   errCountCount = groupCount = groupIDCount = 0;
}


var finishedErrCount =  function(res) {
   groupCount++;
}

var finishedErrorGroup =  function(res) {
   groupCount++;
   
   resolve(res);
}
var finishedGroupID =  function() {
   groupIDCount++;
}
var finishedGroupCount =  function() {
   errCountCount++;
}

// TODO: try to next the call backs so that one function you query the db,
//       when it returns with the query, you call another function that
//       starts the next query, its call back in turn starts the next, and so on.
//       the past one can call a function like "resolve"
var resolve = function(res) {
         
   res.render('index', {
    title: 'Error Group ' + groupID,
    expr: 'Express',
    jade: 'Jade',
    groupIdStr: groupID,
    numErrs: numErrors,
    errsInG: errorsInGroup,
    eGrp: wholeErrorGroup,
    totalGroupCount: groupCount,
    getMonthString: getMonthName // zomg you can export functions too!?!?
   });
   
   resetCounts();
}

var getType = function (error) {    
   e = error;
}

var setErrCountCount = function (num) {
   console.log("got a total errors count - " + num);
	numErrors = num;
	finishedErrCount();
}

var setErrorGroupArray = function (errorGroup, res) {
   console.log("got an Array in group array - " + errorGroup[0]);
   errorsInGroup = errorGroup.length;

   var allTime = new Array();

   var d = new Date();
   d.setDate(31); // last day of month
   d.setMonth(11); // 12th month (december)
   d.setFullYear(2010);

   var idx = 0;

   var errGroup1 = new Array();
   var errGroup2 = new Array();


   for (idx = 0; idx < errorGroup.length; idx++) {
      //console.log(errorGroup[idx].time * 1000);
      //console.log(d.getTime());
      var egDate = new Date(errorGroup[idx].time * 1000);
      var y = egDate.getYear().toString();
      var mo = egDate.getMonth().toString();

      if(allTime[y] == undefined) {
         allTime[y] = new Array();
         allTime[y]['year'] = egDate.getFullYear();
      }

      if(allTime[y][mo] == undefined) {
         allTime[y][mo] = new Array();
         allTime[y][mo]['month'] = egDate.getMonth();
      }

      
      allTime[y.toString()][mo.toString()].push(errorGroup[idx]);
   }
   
/*
   
   - if (eGrp)
      - var idx = 0;
      table.errorGroup
         tr.cols
            th.eID ID
            th.eTime Time
            th.eType Type
            th.eMsg Message
         - eGrp.forEach(function(item){
            - var rDate = new Date(item.time *1000);
            - idx++;   
            tr.error
               td.errorId 
                  | #{idx}.  
                  img#dino(src='dinosaur.png')
                  | #{item._id}
               td.errorTime
                  div m: #{rDate.getMonth()+1} d: #{rDate.getDate()} y: #{rDate.getFullYear()}
                  div locale time: #{rDate.toLocaleTimeString()}
                  div universal time: #{rDate.getUTCHours()}:#{rDate.getUTCMinutes()}:#{rDate.getUTCSeconds()}
               td.errorType #{item.type}
               td.errorMsg #{item.msg}
         - })

div.errors The errors in the second group were (AFTER 12/31/2010):
   - if (eGrp2)
      - var idx = 0;
      table.errorGroup
         tr.cols
            th.eID ID
            th.eTime Time
            th.eType Type
            th.eMsg Message
         - eGrp2.forEach(function(item){
            - var rDate = new Date(item.time *1000);
            - idx++;   
            tr.error
               td.errorId 
                  | #{idx}.  
                  img#dino(src='dinosaur.png')
                  | #{item._id}
               td.errorTime
                  div m: #{rDate.getMonth()+1} d: #{rDate.getDate()} y: #{rDate.getFullYear()}
                  div locale time: #{rDate.toLocaleTimeString()}
                  div universal time: #{rDate.getUTCHours()}:#{rDate.getUTCMinutes()}:#{rDate.getUTCSeconds()}
               td.errorType #{item.type}
               td.errorMsg #{item.msg}
         - })
   */

   wholeErrorGroup = allTime;
   
   finishedErrorGroup(res);
}

var setTotalGroupCount = function (num, res) {
   console.log("got a total groups count - " + num);
   groupCount = num;
   finishedGroupCount(res);
}

var setGroupID = function (idStr) {
   console.log("got a group id - " + idStr);
   groupID = idStr;
   finishedGroupID();
}

var globDB;

var groupCount = 0;
var wholeErrorGroup = {};
var errorsInGroup = 0;
var numErrors = 0;
var groupID = "";

var errorsForGroup = function (gID, res) {
      globDB.collection('errors', function(err, collection) { 
            console.log('ObjectID('+ gID + ')');
            setGroupID(JSON.stringify(gID));
               
            //collection.find({'group-id' : gID}, {limit: 1}, function(err, errorGroup) {
            collection.find({'group-id' : gID}, {sort:[['time', -1]]}, function(err, errorGroup) {

               /*
               errorGroup.count(function(err, c) {
	               setErrorGroupCount(c, res);
               });
               */

               errorGroup.toArray(function(err, c) {
	               setErrorGroupArray(c, res);
               });
               /*
               cursor.each(function(err, eInG) {  
                  if(eInG) {
                     res.write('\n   Group Error: ' + eInG['type'] + " -> " + eInG['msg']);
                     
                     finishedOne();
                  }
               });
                 */
            }); 

      });
}

var getInfo = function (db, res) {
   db.open(function(err, thisDb) {

      globDB = thisDb;
      globDB.collection('errors', function(err, collection) {
         collection.count(function(err, c) {
	         setErrCountCount(c);
	      });
      });
      
      globDB.collection('groups', function(err, collection) {
         collection.count(function(err, c) {
	         setTotalGroupCount(c);
	      });
      });
/*
      globDB.collection('errors', function(err, collection) {   
         collection.find({}, {limit:2, sort:[['time', -1]]}, function(err, cursor) {  
           cursor.each(function(err, error) {  
             if(error) {
               res.write('\n\n\nError found: '+error['type'] + " -> " + error['msg'] + " @ " + error.time);
               finishedOne();
             }
            });  
         });  
      });
      
      globDB.collection('groups', function(err, collection) {   
         collection.find({}, {limit:5}, function(err, cursor) {  
           cursor.each(function(err, group) {  
             if(group) {
               //sys.puts(sys.inspect(group));
               res.write('\n\n\nGroup: ObjectID('+ group._id.toString() + ") -> " + group['msg']);
               res.write("\n   JSON stringify contents: " + JSON.stringify(group));
               res.write("\n   stringified group._id " + JSON.stringify(group._id));
               finishedOne();
             }
            });  
         });  
      }); 
*/

      globDB.collection('groups', function(err, collection) {   
         collection.find({}, {limit:1}, function(err, cursor) {  
           cursor.each(function(err, group) {  
             if(group) {

               errorsForGroup(group._id, res);
               //errorsForGroup(JSON.stringify(group._id), res);

               
             }
            });  
         });  
      });    
      
   });
}


// Routes

app.get('/', function(req, res){

   db = new Db('errrecorderdb', new Server(HOST, DBPORT, {}), {});

   getInfo(db, res);
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(PORT);
  console.log("Express server listening on port %d AND %s", app.address().port, HOST);
}
