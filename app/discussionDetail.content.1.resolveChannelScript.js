
if(item instanceof ProfileItem){
    var ids=([item.getId(), EventList.SharedInstance().getClientProfile().getId()]).sort();
    return "direct-"+ids.join("-");
}

return defaultChannel;