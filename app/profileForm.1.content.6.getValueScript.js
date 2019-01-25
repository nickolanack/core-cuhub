 
 if(item.getId()==EventList.SharedInstance().getClientProfile().getId()){
     return AppClient.getEmail();
 }
 
 
 return "get email"