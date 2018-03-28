el.addClass('link-to-item');
el.addEvent('click',function(){
    application.getNamedValue('navigationController').navigateTo("Single", "Main");
});