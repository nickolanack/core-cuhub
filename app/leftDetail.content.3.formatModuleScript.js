

module.addEvent('selectWord',function(tag){
    
    application.setNamedValue('tagFilter',{tags:[tag]});
	application.getNamedValue('navigationController').navigateTo("Tags", "Main");
    
    
});

module.addEvent('addWord',function(tag, el){
    
    //if matches current tag, then highlight
    el.addClass('btn-tag');
    
    
    var current=application.getNamedValue('tagFilter');
	
	if(current&&current.tags&&current.tags.indexOf(tag)>=0){
	     el.addClass('active');
	}
    
})