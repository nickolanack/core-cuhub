var navigationController=new NavigationMenuModule({
      "Site":[
        {
          "html":"Portal",
          "link":""
        },
        {
          html:"About",
          "link":""
        },
        {
          html:"Contact",
          "link":""
        }
      ]   
        
    },{
        manipulateHistory:false
    });
    
application.setNamedValue('navigationController', navigationController);
return navigationController;