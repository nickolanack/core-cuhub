

if(item instanceof MyProfileItem&&AppClient.getUserType()=="guest"){
    return "You are not logged in"
}



return (item.getName?item.getName():'{name}')+(item.getDateFromNow?' - '+item.getDateFromNow():' - {created from now}')