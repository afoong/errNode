$(document).ready(function(){
  $("img").click(function(){
    $(this).parent().parent().fadeToggle();
  });

  $("#showAll").click(function() {
    $(":hidden", document.body).show('slow');
  });
});
