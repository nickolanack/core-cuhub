el.addClass('link-to-item');
el.addEvent('click'){
    application.getNamedValue('navigationController').navigateTo("Single", "Main");
}