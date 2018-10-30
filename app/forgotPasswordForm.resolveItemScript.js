var ForgotUser=new Class({
        Extends:MockDataTypeItem,
        initialize:function(options){
          var me=this;
          me.parent(options);
          
          me.setEmail=function(email){
              options.email=email;
          }
        },
        save:function(cb){
            
        var me=this;
             
        (new AjaxControlQuery(CoreAjaxUrlRoot,'send_magic_link', {
		  'plugin': "Users",
		  'email':me.getEmail()
		})).addEvent('success',function(){
		    cb(true);
		}).execute(); 
            
            
            
            //callback(true);
        }
})


return (new ForgotUser({
        email:""
			}));