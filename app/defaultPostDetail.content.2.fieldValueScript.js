var id=item.getUserId();

if(id<=0){
    return 'a guest';
}


var user=EventList.SharedInstance().getProfileForUserId(id);
if(user){
    return user.getName();
}

return id;