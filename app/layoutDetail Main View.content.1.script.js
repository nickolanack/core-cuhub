var navigationController=new NavigationMenuModule({
      "Site":[
        {
          "html":"Portal",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController', navigationController).navigateTo("FeedItems", "Main");
              }
          }
        },
        {
          html:"About",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController', navigationController).navigateTo("About", "Main");
              }
          }
        },
        {
          html:"Contact",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController', navigationController).navigateTo("Contact", "Main");
              }
          }
        },
        {
          html:"Archive",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController', navigationController).navigateTo("Archive", "Main");
              }
          }
        }
      ]   
        
    },{
        manipulateHistory:false
    });
    
//application.setNamedValue('navigationController', navigationController);
return navigationController;