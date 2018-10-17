el.addClass('post-author')

var id=item.getUserId();
el.addClass('user-id-'+id);
if(id<=0){
    return;
}
var user=EventList.SharedInstance().getProfileForUserId(id);
if(user){
    valueEl.appendChild(EventItem.CreateAuthorLabel(user, application))
}

