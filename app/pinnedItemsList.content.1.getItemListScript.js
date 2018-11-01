 
 if(AppClient.getUserType()=="guest"){
     return [];
 }
 EventList.SharedInstance(function(el){
    callback(el.getPinnedEvents());
     
    listModule.addWeakEvent(el, "pinnedItem", function(item){
        listModule.addItem(item);
    });
     
 })