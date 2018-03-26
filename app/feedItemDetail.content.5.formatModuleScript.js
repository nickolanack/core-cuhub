module.getElement().addEvent('click', function(e){
    
    e.stop();
    module.draw();
    item.activate();
    
});


module.addWeakEventListener(item, 'deactivate', function(){
    module.empty();
});