

if(item instanceof MyProfileItem&&AppClient.getUserType()=="guest"){
    return "You are not logged in"
}



return (item.getName?item.getName():'{name}')+(item.hasDate()?' - '+item.getDateFromNow():'')