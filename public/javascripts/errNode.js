$(document).ready(function(){
       
   // hides images when you click them
   $(".dino").each(function() {
      $(this).click(function(){
         $(this).parent().parent().fadeToggle();
      });
   });

   // shows all hiden items
   $("#showAll").click(function() {
     $(":hidden", ".y").each(function() {
         $(this).show('slow');
      });
   });

   // hides the month data on year click
   $(".year").each(function() {
      $(this).click(function() {
         
         $(this).siblings().fadeToggle();
      });
   });

   var setGraph = function (gIdx, populateSelect) {
      $.getJSON('/time.json', function(datasets) {

         var index = gIdx;
         if (window.console) {

            console.log(datasets);
         }
         if(populateSelect)
            index = datasets.data.length - 1;

         var d = datasets.data[index];
         var minTime = new Date(datasets.minTime);
         var gName = datasets.names[index];

         if (window.console) {

            console.log(gName);
         }

         document.getElementById('groupName').innerHTML = gName;

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
           series: {
              lines: { show: true }
           },
           xaxis: { mode: "time", tickLength: 5 },
           selection: { mode: "x" },
           crosshair: { mode: "x", lineWidth: 1 },
           grid: { hoverable: true, autoHighlight: false, markings: weekendAreas }
         };

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
       
       function updateLegend() {
       
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

               
           var da = new Date(p1[0]);

               legends.eq(0).text(series.label.replace(/=.*/, "= " + da.toDateString()));
               legends.eq(1).text(series.label.replace(/=.*/, "= " + p1[1]));
           }
       }
       
       $("#placeholder").bind("plothover",  function (event, pos, item) {
           latestPosition = pos;
           if (!updateLegendTimeout)
               updateLegendTimeout = setTimeout(updateLegend, 50);
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
         
      });  
     
   };

            
   $("#selector").change(function () {
      $("select option:selected").each(function () {
         setGraph($(this).val(), false);
      });
   })
   .change();  

   
   $(setGraph(1, true));

   var setTurningSeriesGraph = function() {
      $.getJSON('/turningSeries.json', function(datasets) {
         if(window.console) {
            console.log("turning: " + JSON.stringify(datasets));
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

       
       function plotAccordingToChoices() {
           var data = [];

           choiceContainer.find("input:checked").each(function () {
               var key = $(this).attr("name");
               if (key && datasets[key])
                   data.push(datasets[key]);
           });

           if (data.length > 0)
               $.plot($("#placeholder1"), data, {
                  legend: {container: $("#legendTurningSeries")},
                   yaxis: { min: 0 },
                   xaxis: { mode: "time", tickDecimals: 0 }
               });
       }

       plotAccordingToChoices();
      });
   }
   
   $(setTurningSeriesGraph);
});



