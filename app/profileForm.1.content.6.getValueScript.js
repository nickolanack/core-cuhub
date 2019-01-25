 
 if(item.getId()==EventList.SharedInstance().getClientProfile().getId()){
     return AppClient.options.metadata.email;
 }
 
 
 return "get email"