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
   

/*
   // hides the month data on year click
   $(".year").children().each(function() {
      $(this).parent().click(function() {
         $(this).children().fadeToggle();
      });
   });
*/

   $(function () {
      $.getJSON('/time.json', function(datasets) {

         console.log(datasets);

         var d = datasets.data[0];
         var minTime = new Date(datasets.minTime);

         $.plot($("#placeholder"), [d], { xaxis: { mode: "time" } });

         $("#whole").click(function () {
           $.plot($("#placeholder"), [d], { xaxis: { mode: "time" } });
         });

         $("#days").click(function () {
            $.plot($("#placeholder"), [d], {
               xaxis: {
                  mode: "time",
                  minTickSize: [1, "day"],
                  min: minTime.getTime(),
                  max: new Date().getTime()
               }
            });
         });

         $("#months").click(function () {
            $.plot($("#placeholder"), [d], {
               xaxis: {
                  mode: "time",
                  minTickSize: [1, "month"],
                  min: minTime.getTime(),
                  max: new Date().getTime()
               }
            });
         });      
      });
   });
});


