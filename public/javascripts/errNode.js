$(document).ready(function(){

   // hides images when you click them
   $("img").click(function(){
      $(this).parent().parent().fadeToggle();
   });

   // shows all hiden items
   $("#showAll").click(function() {
      $(":hidden", document.body).show('slow');
   });

   // hides the month data on year click
   $(".year").click(function() {
      $(this).siblings().fadeToggle();
   });
   

/*
   // hides the month data on year click
   $(".year").children().each(function() {
      $(this).parent().click(function() {
         $(this).children().fadeToggle();
      });
   });
*/
   
});


