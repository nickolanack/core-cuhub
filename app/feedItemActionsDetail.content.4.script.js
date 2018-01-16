if(item.isPublished()){
    return null;
}
return new ModalFormButtonModule(application, 
    item, {
    "label":"Publish your profile",
    "formName":"profileForm",
    "formOptions":{
        "template":"form"
    }
})