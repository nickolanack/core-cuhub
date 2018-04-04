

module.addEvent('selectWord',function(tag){
    
    application.setNamedValue('tagFilter',{tags:[tag]});
	application.getNamedValue('navigationController').navigateTo("Tags", "Main");
    
    
})