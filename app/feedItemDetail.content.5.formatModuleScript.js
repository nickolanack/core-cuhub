var nav=application.getNamedValue('navigationController');

module.getElement().addEvent('click', function(e){
    
    if(item.isActive()&&nav.getCurrentView().view=="Single"){
        return;
    }
    
    item.activate();
   
    
    // if(item.isPinned()&&nav.getCurrentView().view!=="Pinned"){
    //     nav.navigateTo("Pinned", "Main");
    //     return;
    // }
    
    // if(item.isArchived()&&nav.getCurrentView().view!=="Archive"){
    //     nav.navigateTo("Archive", "Main");
    //     return;
    // }
    
  
    
    nav.navigateTo("Single", "Main");
   
});

if((item.isActive()&&nav.getCurrentView().view=="Single")||item instanceof MyProfileItem){
     module.draw();
}

module.addWeakEvent(item, 'deactivate', function(){
    module.empty();
});

module.addWeakEvent(item, 'activate', function(){
     //module.draw();
});