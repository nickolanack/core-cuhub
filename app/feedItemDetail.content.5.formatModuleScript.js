module.getElement().addEvent('click', function(e){
    item.activate();
});


module.addWeakEvent(item, 'deactivate', function(){
    module.empty();
});

module.addWeakEvent(item, 'activate', function(){
     module.draw();
});