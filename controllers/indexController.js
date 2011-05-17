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
   //groupCount++;
}

var finishedErrorGroupTime =  function(res, gName, gIds, gMsgs) {
   groupsTimes.push(groupTime);
   
   if(groupTimePackage['data'] == undefined) {
      groupTimePackage['data'] = new Array();
   }
   
   if(groupTimePackage['data2'] == undefined) {
      groupTimePackage['data2'] = new Array();
   }

   if (groupTimePackage['names'] == undefined) {
      groupTimePackage['names'] = new Array();
   }
   
   if (groupTimePackage['messages'] == undefined) {
      groupTimePackage['messages'] = new Array();
   }

   if(groupTimePackage['gids'] == undefined){
      groupTimePackage['gids'] = new Array();
   }
      
   groupTimePackage['data'].push(groupTime);
   groupTimePackage['data2'].push(groupChangeTime);
   groupTimePackage['names'].push(gName);
   groupTimePackage['gids'].push(gIds);
   groupTimePackage['messages'].push(gMsgs);
   
   groupCount++;
   if(groupCount >= globGroupCount || (groupCount >= limitedGroupCount && limitedGroupCount > 0))
      resolve(res);
}
var finishedErrorGroup =  function(res) {
   groupCount++;
   //if(groupCount >= globGroupCount || groupCount >= limitedGroupCount)
   //   resolve(res);
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
    datasets: groupErrors,
    groupIdStr: groupID,
    numErrs: numErrors,
    errsInG: errorsInGroup,
    eGrp: wholeErrorGroup,
    totalGroupCount: globGroupCount,
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

var setGroupTime = function (errorGroup, gID, gMsg, res) {

   var idx = 0;
   if(neverSet) { // first time thru => lowest time (min)
      neverset = false;
      groupTimePackage['minTime'] = errorGroup[idx].time * 1000;
   }

   groupTime = new Array();
   groupChangeTime = new Array();
   var numYears = 0;
   var idTxt = (''+gID);
   var groupID = idTxt.substring(idTxt.length-9, idTxt.length);

   var grpName = new Array();
   var grpMessages = new Array();
   //console.log(errorGroup[0]._id);
   
   //console.log(errorGroup[0].msg.split(/[ ]+/));

   for (idx = 0; idx < errorGroup[0].msg.split(/[ ]+/).length; idx++)
   {
      grpName.push(errorGroup[0].msg.split(/[ ]+/)[idx]);
   }

   var dayChange = 1;
   var lastTime = 0;
   var currTime = 0;
   
   
   for (idx = 0; idx < errorGroup.length; idx++) {

      grpMessages.push(errorGroup[idx].msg.substring(0,150));

      currTime = errorGroup[idx].time * 1000;
      
      if(groupTime[idx] == undefined) {
         groupTime[idx] = new Array();
      }

      var lastDate = new Date(lastTime);
      var currDate = new Date(currTime);

      if(lastTime != 0 && ((currDate.getDate() != lastDate.getDate()) || (lastDate.getFullYear() != currDate.getFullYear()))) {
         groupChangeTime.push(new Array(lastTime, dayChange));
         dayChange = 1;
      }

      dayChange++;

      groupTime[idx][0] = errorGroup[idx].time * 1000;
      groupTime[idx][1] = idx + 1;

      //console.log(errorGroup[idx].msg.split(/[ ]+/));

      for(var i = 0; i < errorGroup[idx].msg.split(/[ ]+/).length; i++)
      {
         if (i < grpName.length)
         {
            if(grpName[i] != errorGroup[idx].msg.split(/[ ]+/)[i]) {
               grpName[i] = '*';
            }
         }
         else
         {
            grpName.push('*');
         }
      }

      lastTime = currTime;
   }
   //console.log("\n\n");
   
   finishedErrorGroupTime(res, grpName.join(' '), idTxt, grpMessages/* + ' --was-- ' + gMsg*/);
}

var setErrorGroupArray = function (errorGroup, res) {
   console.log("got an Array in group array - " + errorGroup[0]);
   errorsInGroup = errorGroup.length;

   var allTime = new Array();

   var idx = 0;

   // creates a super array!
   //    allTime
   //       year#.year = e.x. 2010
   //       year#.month#.month = ex.x 5 (june; months are 0-11)
   //       year#.month# = array of Errors - each Error is an error with time == m#/y#
   //       
   var numYears = 0;
   
   for (idx = 0; idx < errorGroup.length; idx++) {
      var egDate = new Date(errorGroup[idx].time * 1000);
      var y = egDate.getYear().toString();
      var mo = egDate.getMonth().toString();

      if(allTime[y] == undefined) {
         allTime[y] = new Array();
         allTime[y]['year'] = egDate.getFullYear();
         allTime[y]['numMonths'] = 0;
         numYears++;
      }

      if(allTime[y][mo] == undefined) {
         allTime[y][mo] = new Array();
         allTime[y][mo]['month'] = egDate.getMonth();
         allTime[y]['numMonths']++;
      }

      
      allTime[y.toString()][mo.toString()].push(errorGroup[idx]);
   }

   allTime['numYears'] = numYears;

   wholeErrorGroup = allTime;
}

var setTotalGroupCount = function (num, res) {
   console.log("got a total groups count - " + num);
   globGroupCount = num;
   finishedGroupCount(res);
}

var setGroupID = function (idStr) {
   console.log("got a group id - " + idStr);
   groupID = idStr;
   finishedGroupID();
}

var globDB;

var globGroupCount = 0;
var limitedGroupCount = 0;
var groupCount = 0;
var wholeErrorGroup = {};
var groupErrors = {};
var errorsInGroup = 0;
var numErrors = 0;
var groupID = "";
var groupTime = new Array();
var groupChangeTime = new Array();
var groupsTimes = new Array();
var groupTimePackage = {};
var eGrpCounts = new Array();

var neverSet = true;
var counted = 0;

var sorterfun = function(a, b) {
   return b.count - a.count;
}

var turningSeriesDocument = function(timeDataSet) {
   var doc = {};
   
   for(var i = 0; i < timeDataSet.data.length; i++) {
      doc[""+timeDataSet.names[i]] = {};
      doc[""+timeDataSet.names[i]].label = ""+timeDataSet.names[i];
      doc[""+timeDataSet.names[i]].data = new Array();

      for(var q = 0; q < timeDataSet.data[i].length; q++) {
         doc[""+timeDataSet.names[i]].data.push(timeDataSet.data[i][q]);  
      }
   }

   return doc;
}

var countEachGroup = function (group, res) {
   globDB.collection('errors', function(err, collection) {
      collection.find({'group-id' : group._id}, {sort:[['time', 1]]}, function(err, errorGroup) {
         errorGroup.count(function(err, c) {
            var data = {};
            data.id = group._id;
            data.msg = group.msg;
            data.count = c;
            eGrpCounts.push(data);

            if(eGrpCounts.length >= globGroupCount) {
               eGrpCounts.sort(sorterfun);

               limitedGroupCount = 10;

               if(limitedGroupCount < 1 || limitedGroupCount > eGrpCounts.length)
                  limitedGroupCount = eGrpCounts.length;

               for(var i = 0; i < limitedGroupCount; i++) {
                  //console.log(eGrpCounts[i]);
                  processEachGroup(eGrpCounts[i].id, eGrpCounts[i].msg, res);
               }
               //console.log(eGrpCounts);
            }
         });
      });
   });
}

var processEachGroup = function (gID, gMsg, res) {
   globDB.collection('errors', function(err, collection) {
      collection.find({'group-id' : gID}, {sort:[['time', 1]]}, function(err, errorGroup) {
         //console.log("--" + gID);
         errorGroup.toArray(function(err, c) {
            //setGroup(c, gID, res);   
            setGroupTime(c, gID, gMsg, res);
         });
      });
   });
}

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

exports.getInfo = getInfo;

var getInfo = function (db, res) {
   // reinit
   groupTimePackage.data = new Array();
   groupTimePackage.names = new Array();
   groupTimePackage.minTime = 0;
   
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

      globDB.collection('groups', function(err, collection) {   
         collection.find({}, {limit:1}, function(err, cursor) {  
           cursor.each(function(err, group) {  
             if(group) {

               errorsForGroup(group._id, res);
               
             }
            });  
         });  
      });   

      groupCount = 0;
      /*
      limitedGroupCount = 20;
      var limitSet = {};
      if(limitedGroupCount > 0) {
         limitSet.limit = limitedGroupCount;
      }
      */
        
      eGrpCounts.length = 0;

      globDB.collection('groups', function(err, collection) {
         collection.find({}, {}, function(err, cursor) {  
            //globGroupCount = cursor.length;
           cursor.each(function(err, group) {  
             if(group) {
               countEachGroup(group, res); 
             }
            });  
         });  
      }); 

         /*
      globDB.collection('groups', function(err, collection) {
         collection.find({}, limitSet, function(err, cursor) {  
            //globGroupCount = cursor.length;
           cursor.each(function(err, group) {  
             if(group) {
               //console.log(group._id);
               groupErrors[group._id] = {};
               groupErrors[group._id].label = group._id;
               processEachGroup(group._id, group.msg, res);
               //errorsForGroup(JSON.stringify(group._id), res);
               
               
             }
            });  
         });  
      }); 
      */
      
   });
}

// http request to return json document (text/plain maybe)
// jquery should be able to query url for json document
// model : separate 5 line program - client side requests time of day
// return time in json

// Routes

app.get('/datasets.json', function(req, res) {
   res.charset = 'UTF-8'; 
   res.header('Content-Type', 'application/json'); 
   res.write(JSON.stringify(groupErrors));
   res.end(); 
});

app.get('/time.json', function(req, res) {
   res.charset = 'UTF-8'; 
   res.header('Content-Type', 'application/json'); 
   res.write(JSON.stringify(groupTimePackage));
   res.end(); 
});

app.get('/turningSeries.json', function(req, res) {
   res.charset = 'UTF-8'; 
   res.header('Content-Type', 'application/json'); 
   res.write(JSON.stringify(turningSeriesDocument(groupTimePackage)));
   res.end(); 
});

app.get('/', function(req, res){

   db = new Db('errrecorderdb', new Server(HOST, DBPORT, {}), {});

   getInfo(db, res);
});


