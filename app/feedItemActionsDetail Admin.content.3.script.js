
if(!item.canCreate('connection')){
    return null;
}

return (new ModalFormButtonModule(application, 
    new ConnectionItem({
        "item":item,
    }).addEvent("save", function(){
        var item=this;
        EventList.SharedInstance(function(el){
            
            el.addItem(item);
            
        });
    }), {
    "label":((item instanceof MyProfileItem)?<?php 
        
       echo json_encode(($ui=GetWidget('interfaceConfig'))->getParameter('label-for-create-connection'));
    
        ?>:<?php 
        
       echo json_encode($ui->getParameter('label-for-item-create-connection'));
    
    ?>).replace('{type}', item.getTypeName()),
    "formName":"connectionForm",
    "formOptions":{
        "template":"form",
        "className":"connection-form"
    },
    "className":"action-connection"
}))