
if(!item.canCreate('request')){
    return null;
}

return (new ModalFormButtonModule(application, 
    new ConnectionRequestItem({
        "item":item,
    }).addEvent("save", function(){
        var item=this;
        EventList.SharedInstance(function(el){
            
            el.addItem(item);
            
        });
    }), {
    "label":"Create Connection Request",
    "formName":"requestForm",
    "formOptions":{
        "template":"form"
    },
    "className":"action-request"
}))