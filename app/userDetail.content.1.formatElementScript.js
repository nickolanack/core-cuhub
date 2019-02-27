
if(AppClient.getUserType()=="guest"){
    return;
}

el.addClass("notification-center");

EventList.SharedInstance(function(itemList){
    CuhubDashboard.formatNotificationCenter(el, itemList.getClientProfile());
})
