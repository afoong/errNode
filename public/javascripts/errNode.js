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
   
});


