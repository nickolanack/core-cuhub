var myProfile=item;
if(item.getType()=="ProjectHub.profile"&&item.clientOwns()&&!(item instanceof MyProfileItem)){
    myProfile=EventList.SharedInstance().getClientProfile();
}


if(!(myProfile instanceof MyProfileItem)){
    module.setRenderOnLoad(false);
}