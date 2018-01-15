return new ModalFormButtonModule(application, 
    new ConnectionRequestItem({
        "item":item,
    }), {
    "label":"Create Connection Request",
    "formName":"createConnection",
    "formOptions":{
        "template":"form"
    }
})