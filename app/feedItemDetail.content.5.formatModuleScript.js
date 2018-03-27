module.getElement().addEvent('click', function(e){
    if(item.isPinned()){
        application.getNamedValue('navigationController').navigateTo("Pinned", "Main");
    }
    if(item.isArchived()){
        application.getNamedValue('navigationController').navigateTo("Archive", "Main");
    }
    item.activate();
});

if(item.isActive()){
     module.draw();
}

module.addWeakEvent(item, 'deactivate', function(){
    module.empty();
});

module.addWeakEvent(item, 'activate', function(){
     module.draw();
});