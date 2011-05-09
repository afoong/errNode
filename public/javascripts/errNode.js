$(document).ready(function(){
       
   // hides images when you click them
   $(".dino").each(function() {
      $(this).click(function(){
         $(this).parent().parent().fadeToggle();
      });
   });

   // hides the month data on year click
   $(".year").each(function() {
      $(this).click(function() {
         
         $(this).siblings().fadeToggle();
      });
   });

   var currVal = 0;
   var numGraphs = 0;

   var setGraph = function (gIdx, populateSelect) {
      $("#bbox").show();
      $("#loading").show();
      $.getJSON('/time.json', function(datasets) {
         numGraphs = datasets.data.length;
         
         var index = gIdx;
         
         if(populateSelect)
            index = datasets.data.length - 1;

         var d = datasets.data[index];
         var minTime = new Date(datasets.minTime);
         var gName = datasets.names[index];


         document.getElementById('groupName').innerHTML = gName;
         document.getElementById('groupID').innerHTML = "You have selected group ID: " + datasets.gids[index];
         $('#groupID').show();
         $('#overlayGroupID').text(datasets.gids[index]);
         $('#overlayGroupName').text(gName);

       // first correct the timestamps - they are recorded as the daily
       // midnights in UTC+0100, but Flot always displays dates in UTC
       // so we have to add one hour to hit the midnights in the plot
       for (var i = 0; i < d.length; ++i)
         d[i][0] += 60 * 60 * 1000;

         // helper for returning the weekends in a period
         function weekendAreas(axes) {
           var markings = [];
           var d = new Date(axes.xaxis.min);
           // go to the first Saturday
           d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7))
           d.setUTCSeconds(0);
           d.setUTCMinutes(0);
           d.setUTCHours(0);
           var i = d.getTime();
           do {
               // when we don't set yaxis, the rectangle automatically
               // extends to infinity upwards and downwards
               markings.push({ xaxis: { from: i, to: i + 2 * 24 * 60 * 60 * 1000 } });
               i += 7 * 24 * 60 * 60 * 1000;
           } while (i < axes.xaxis.max);

           return markings;
         }

         var options = {    
           points: { show: true },
           series: {
              lines: { show: true }
           },
           xaxis: { mode: "time", tickLength: 5 },
           selection: { mode: "x" },
           crosshair: { mode: "x", lineWidth: 1 },
           grid: { hoverable: true, clickable: true, autoHighlight: false, markings: weekendAreas },    
           legend: {show: true, position: 'nw'}

         };

            function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80,
            '-moz-border-radius': '5px',
            'border-radius': '5px'
        }).appendTo("body").fadeIn(200);
    }

    var previousPoint = null;
    $("#placeholder").bind("plothover", function (event, pos, item) {
         $("#x").text(pos.x.toFixed(2));
         $("#y").text(pos.y.toFixed(2));

         if (item) {
             if (previousPoint != item.dataIndex) {
                 previousPoint = item.dataIndex;
                 
                 $("#tooltip").remove();
                 var x = item.datapoint[0],
                     y = item.datapoint[1];
                 
                 showTooltip(item.pageX, item.pageY,
                             "Error " + y + " of " + (d.length-1) + " made on " + new Date(x).toDateString());
             }
         }
         else {
             $("#tooltip").remove();
             previousPoint = null;            
         }
    });

    $("#placeholder").bind("plotclick", function (event, pos, item) {
        if (item) {
            $("#clickdata").show().text("The " + item.datapoint[1] + 'th error in this group was created on ' + new Date(item.datapoint[0]));
            plot.highlight(item.series, item.datapoint);
        }
    });

         var plot = $.plot($("#placeholder"), [{data: d, label:"Time = 0"}, {data: d, label:"Count = 0"}], options);

         var overview = $.plot($("#overview"), [d], {
           series: {
               lines: { show: true, lineWidth: 1 },
               shadowSize: 0
           },
           xaxis: {mode: "time", ticks: [] },
           yaxis: { ticks: [], min: 0, autoscaleMargin: 0.1 },
           selection: { mode: "x" }
         });

       var updateLegendTimeout = null;
       var latestPosition = null;
       
       function updateSelectGraphLegend() {
       
            var legends = $("#placeholder .legendLabel");
            legends.each(function () {
                 // fix the widths so they don't jump around
                 $(this).css('width', $(this).width());
            });
           updateLegendTimeout = null;
           
           var pos = latestPosition;
           
           var axes = plot.getAxes();
           if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
               pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
               return;

           var i, j, dataset = plot.getData();
           for (i = 0; i < dataset.length; ++i) {
               var series = dataset[i];

               // find the nearest points, x-wise
               for (j = 0; j < series.data.length; ++j)
                   if (series.data[j][0] > pos.x)
                       break;

               // now interpolate
               var y, p1 = series.data[j];

               if(p1) {
               
                  var da = new Date(p1[0]);

                  legends.eq(0).text("Time = " + da.toDateString());
                  legends.eq(1).text("Count = " + p1[1]);
               }
               
           }
       }
       
       $("#placeholder").bind("plothover",  function (event, pos, item) {
           latestPosition = pos;
           if (!updateLegendTimeout)
               updateLegendTimeout = setTimeout(updateSelectGraphLegend, 50);
       });
         // now connect the two

         $("#placeholder").bind("plotselected", function (event, ranges) {
           // do the zooming
           plot = $.plot($("#placeholder"),  [{data: d, label:"Time = 0"}, {data: d, label:"Count = 0"}],
                         $.extend(true, {}, options, {
                             xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                         }));

           // don't fire event on the overview to prevent eternal loop
           overview.setSelection(ranges, true);
         });
         
          $("#showAll").click(function () {
              plot = $.plot($("#placeholder"), [{data: d, label:"Time = 0"}, {data: d, label:"Count = 0"}], options);
              plot.clearSelection();
              overview.clearSelection();
          });

         $("#overview").bind("plotselected", function (event, ranges) {
           plot.setSelection(ranges);
         });

         // populate select 
         if(populateSelect) {
            for(var i = datasets.data.length; i >= 0; i--) {
               $("#selector").
                   append($("<option></option>").
                   attr("value",i).
                   text(datasets.names[i])); 
            }      
         }

         
         $(".grpMsg").remove();
         var gml = $("#grpMessageList");
         for(var i = 0; i < datasets.messages[index].length; i++) {
            //console.log(datasets.messages[index][i]);
            gml.after("<li class=\"grpMsg\">"+datasets.messages[index][i]+"</li>");
         }
         
         $("#bbox").hide();
         $("#loading").hide();
      });  
     

   };

    $('#showErrorMessages').click(function() {
      $('#errorMessageOverlay').toggle();
      /*$(this).children().each(function() {
         $(this).show();
      });*/
    });

    $('#closeErrorMessages').click(function() {
      $(this).parent().hide();
    });
    
    $(".message").click(function() {
      $(this).text("");
    });
    
    $(".bye").click(function() {
      $(this).hide();
    });
   
   $("#next").click(function () {
      if(window.console) {
         //console.log("next selctor");
      }
         $('#selector').find(' option:selected', 'select').removeAttr('selected').next('option').attr('selected', 'selected');
         $('#selector').trigger('change');
   });
            
   $("#selector").change(function () {
      $("select option:selected").each(function () {
         setGraph($(this).val(), false);
         currVal = $(this).val();
      });
   })
   .change();  

   
   $(setGraph(1, true));

   var setTurningSeriesGraph = function() {
      $.getJSON('/turningSeries.json', function(datasets) {
         if(window.console) {
            //console.log("turning: " + JSON.stringify(datasets));
         }
         
       // hard-code color indices to prevent them from shifting as
       // countries are turned on/off
       var i = 0;
       $.each(datasets, function(key, val) {
           val.color = i;
           ++i;
       });
       
       // insert checkboxes 
       var choiceContainer = $("#choices");
       $.each(datasets, function(key, val) {
           choiceContainer.append('<input type="checkbox" name="' + key +
                                  '" checked="checked" id="id' + key + '">' +
                                  '<label for="id' + key + '">'
                                   + val.label + '</label><br />');
       });
       choiceContainer.find("input").click(plotAccordingToChoices);

      var prevRange = false;
      var rangesArr = {xfrom: 0, xto: 0};
       
       function plotAccordingToChoices() {
           var data = [];

           choiceContainer.find("input:checked").each(function () {
               var key = $(this).attr("name");
               if (key && datasets[key])
                   data.push(datasets[key]);
           });


              
          // first correct the timestamps - they are recorded as the daily
          // midnights in UTC+0100, but Flot always displays dates in UTC
          // so we have to add one hour to hit the midnights in the plot
          for (var i = 0; i < data.length; ++i)
            data[i][0] += 60 * 60 * 1000;

            // helper for returning the weekends in a period
            function weekendAreas(axes) {
              var markings = [];
              var d = new Date(axes.xaxis.min);
              // go to the first Saturday
              d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7))
              d.setUTCSeconds(0);
              d.setUTCMinutes(0);
              d.setUTCHours(0);
              var i = d.getTime();
              do {
                  // when we don't set yaxis, the rectangle automatically
                  // extends to infinity upwards and downwards
                  markings.push({ xaxis: { from: i, to: i + 2 * 24 * 60 * 60 * 1000 } });
                  i += 7 * 24 * 60 * 60 * 1000;
              } while (i < axes.xaxis.max);

              return markings;
            }

          var options = {
              series: {
                  lines: { show: true },
                  points: { show: false }
              },
              legend: { container: $("#legendTurningSeries") },
              xaxis: { mode: "time", tickDecimals: 0 },
              yaxis: { min: 0 },
              selection: { mode: "x" },
              crosshair: { mode: "x", lineWidth: 1 },
              grid: { hoverable: true, clickable: true, autoHighlight: false, markings: weekendAreas },    
          };
          

           var placeholder1 = $("#placeholder1");
           if (data.length > 0) {
               if(prevRange) {
                  $.plot(placeholder1, data,
                                   $.extend(true, {}, options, {
                                       xaxis: { min: rangesArr.xfrom, max: rangesArr.xto }
                                   }));
               }
               else {
                  $.plot(placeholder1, data, options);
               }

               

             placeholder1.bind("plotselected", function (event, ranges) {
                     plot = $.plot(placeholder1, data,
                                   $.extend(true, {}, options, {
                                       xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                                   }));
                     rangesArr.xfrom = ranges.xaxis.from;
                     rangesArr.xto = ranges.xaxis.to;
                     prevRange = true;
             });
          }

                   
          $("#showAll2").click(function () {
              plot = $.plot($("#placeholder1"), data, options);
              plot.clearSelection();
              prevRange = false;
          });
         
       }

      $("#restoreAllSeries").click(function() {
         $("#choices").children().each(function(){
               if(!$(this).attr('checked'))
                  $(this).trigger('click');
         });
         plotAccordingToChoices();
      });

       plotAccordingToChoices();

       
      });
   }
   
   $(setTurningSeriesGraph);
});



