var ForgotUser=new Class({
        Extends:MockDataTypeItem,
        save:function(cb){
            
            callback(true);
        }
})


return (new ForgotUser({
        email:""
			}));