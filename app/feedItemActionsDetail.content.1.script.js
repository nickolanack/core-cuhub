
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
    "label":"Create Project",
    "formName":"projectForm",
    "formOptions":{
        "template":"form"
    },
    "className":"action-project"
}))