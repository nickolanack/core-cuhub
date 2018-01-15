return new ModalFormButtonModule(application, 
    new ProjectItem({
        "item":item,
    }), {
    "label":"Create Project",
    "formName":"projectForm",
    "formOptions":{
        "template":"form"
    }
})