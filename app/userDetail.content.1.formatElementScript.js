
if(AppClient.getUserType()=="guest"){
    return;
}

el.addClass("notification-center");
CuhubDashboard.formatNotificationCenter(el, item);