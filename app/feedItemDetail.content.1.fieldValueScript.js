

if(AppClient.getUserType()=="guest"){
    return "You are not logged in"
}



return (item.getName?item.getName():'{name}')+' - '+(item.getDescription?item.getDescription():'{description}')