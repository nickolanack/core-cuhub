

if(item instanceof MyProfileItem&&AppClient.getUserType()=="guest"){
    return "You are not logged in"
}



var str= (item.getName?item.getName():"{name}");



return str;