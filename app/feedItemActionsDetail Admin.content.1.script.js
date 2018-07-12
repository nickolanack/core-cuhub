
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
    "label":((item instanceof MyProfileItem)?<?php 
        
       echo json_encode(($ui=GetWidget('interfaceConfig'))->getParameter('label-for-create-project'));
    
        ?>:<?php 
        
       echo json_encode($ui->getParameter('label-for-item-create-project'));
    
    ?>).replace('{type}', item.getTypeName()),
    "formName":"projectForm",
    "formOptions":{
        "template":"form",
        "className":"project-form"
    },
    "className":"action-project"
}))