
if(!item.canCreate('connection')){
    return null;
}

return (new ModalFormButtonModule(application, 
    new ConnectionItem({
        "item":item,
    }).addEvent("save", function(){
        var item=this;
        EventList.SharedInstance(function(el){
            
            el.addItem(item);
            
        });
    }), {
    "label":(item instanceof MyProfileItem)?"Add Personal Connection":"Add "+item.getTypeName()+" Connection",
    "formName":"connectionForm",
    "formOptions":{
        "template":"form",
        "className":"connection-form"
    },
    "className":"action-connection"
}))