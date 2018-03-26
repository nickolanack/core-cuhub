el.addClass('feed-item-label')



if(item instanceof MyProfileItem&&AppClient.getUserType()=="guest"){
    return;
}

if(item.getType()==="ProjectHub.event"){
    
    if(item.hasEventDate()){
       
         valueEl.appendChild(new Element('span',{
        "class":"event-date-from-now",
        html:' '+item.getEventDateFromNow()}));      
      
    }
    
}

if(item instanceof ConnectionItem){
    
    if(item.isConnected()){
        var connectedTo=item.getConnectionTo();
         valueEl.appendChild(new Element('span',{
        "class":"item-connection-to",
        html:" "+connectedTo.getName()}));
      
    }else{
        valueEl.appendChild(new Element('span',{
        "class":"item-connection-to",
        html:" {not connected}"}));
    }
    
}



if(item.hasOwner()){
  
    var owner=item.getOwnersProfile();
  
  var userEl=valueEl.appendChild(new Element('span',{
    "class":"item-author",
    html:" "+
        (item.isEqualTo(EventList.SharedInstance().getClientProfile())?"You":owner.getName())}));
  
  
    var icon= new Element('div',{"class":"feed-item-icon"});
    
    if(owner.hasIcon()){
        icon.addClass('user-icon');
        icon.setStyle("background-image","url('"+owner.getIcon()+"')");
    }
    
    userEl.appendChild(icon);
    
    
    
}


        
valueEl.appendChild(new Element('span',{
    "class":"date-from-now",
    html:(item.hasDate()?' '+item.getDateFromNow():"")}));        
