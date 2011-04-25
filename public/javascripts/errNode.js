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
         console.log(datasets);
         if(populateSelect)
            index = datasets.data.length - 1;

         var d = datasets.data[index];
         var minTime = new Date(datasets.minTime);
         var gName = datasets.names[index];

         console.log(gName);

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
           xaxis: { mode: "time", tickLength: 5 },
           selection: { mode: "x" },
           grid: { markings: weekendAreas }
         };

         var plot = $.plot($("#placeholder"), [d], options);

         var overview = $.plot($("#overview"), [d], {
           series: {
               lines: { show: true, lineWidth: 1 },
               shadowSize: 0
           },
           xaxis: {mode: "time", ticks: [] },
           yaxis: { ticks: [], min: 0, autoscaleMargin: 0.1 },
           selection: { mode: "x" }
         });

         // now connect the two

         $("#placeholder").bind("plotselected", function (event, ranges) {
           // do the zooming
           plot = $.plot($("#placeholder"), [d],
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
});



