
if(!item.canCreate('connection')){
    return null;
}

return new ModalFormButtonModule(application, 
    new ConnectionItem({
        "item":item,
    }), {
    "label":"Add Personal Connection",
    "formName":"connectionForm",
    "formOptions":{
        "template":"form"
    }
})