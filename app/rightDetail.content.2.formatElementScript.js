el.addClass("section-item-icon")
el.addEvent('click',function(){
  application.getNamedValue('navigationController').navigateTo("Calendar", "Main"); 
});