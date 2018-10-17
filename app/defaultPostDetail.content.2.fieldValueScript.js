var id=item.getUserId();

if(id>=0){
    return 'a guest';
}


var eList=EventList.SharedInstance();
if(eList.hasItem(id, 'profile')){
    return eList.getItem(id, 'profile').getName();
}

return id;