if(item.isPublished()){
    return null;
}
return new ModalFormButtonModule(application, 
    new ConnectionRequestItem({
        "item":item,
    }), {
    "label":"Publish your profile",
    "formName":"profileForm",
    "formOptions":{
        "template":"form"
    }
})