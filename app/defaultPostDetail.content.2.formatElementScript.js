el.addClass('post-author')

var id=item.getUserId();
el.addClass('user-id-'+id);
var user=EventList.SharedInstance().getProfileForUserId(id);
if(user){
    valueEl.appendChild(EventItem.CreateAuthorLabel(user, application))
}

