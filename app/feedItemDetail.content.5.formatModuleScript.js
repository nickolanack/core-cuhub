module.getElement().addEvent('click', function(e){
    var nav=application.getNamedValue('navigationController');
    
    if(item.isPinned()&&nav.getCurrentView().view!=="Pinned"){
        nav.navigateTo("Pinned", "Main");
    }
    if(item.isArchived()&&nav.getCurrentView().view!=="Archive"){
        nav.navigateTo("Archive", "Main");
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