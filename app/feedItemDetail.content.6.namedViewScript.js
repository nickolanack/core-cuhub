if(item instanceof MyProfileItem){
    
    if(AppClient.getUserType()=="guest"){
        return 'guestExpandedDetail';
    }
    
    return 'profileExpandedDetail';
}


return namedView