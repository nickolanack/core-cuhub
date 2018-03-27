module.getElement().addEvent('click', function(e){
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