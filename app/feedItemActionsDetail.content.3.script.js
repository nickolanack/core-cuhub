
if(!item.canCreate('request')){
    return null;
}

return new ModalFormButtonModule(application, 
    new ConnectionRequestItem({
        "item":item,
    }), {
    "label":"Create Connection Request",
    "formName":"requestForm",
    "formOptions":{
        "template":"form"
    }
})