el.addClass('post-author')

var id=item.getUserId();
var user=EventList.SharedInstance().getProfileForUserId(id);
if(user){
    valueEl.appendChild(EventItem.CreateAuthorLabel(user, application))
}

