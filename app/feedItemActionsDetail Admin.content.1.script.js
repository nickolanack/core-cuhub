
if(!item.canCreate('project')){
    return null;
}

return (new ModalFormButtonModule(application, 
    new ProjectItem({
        "item":item,
    }).addEvent("save", function(){
        var item=this;
        EventList.SharedInstance(function(el){
            
            el.addItem(item);
            
        });
    }), {
    "label":(item instanceof MyProfileItem)?"Create New Project":((item instanceof ProjectItem)?"Add Sub-Project":"Add "+item.getTypeName()+" Project"),
    "formName":"projectForm",
    "formOptions":{
        "template":"form",
        "className":"project-form"
    },
    "className":"action-project"
}))