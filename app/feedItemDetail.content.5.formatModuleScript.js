module.getElement().addEvent('click', function(e){
    
    e.stop();
    module.draw();
    item.activate();
    
});


module.addWeakEvent(item, 'deactivate', function(){
    module.empty();
});