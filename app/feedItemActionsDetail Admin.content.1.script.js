

if(!item.canCreate('event')){
    return null;
}
return (new ModalFormButtonModule(application, 
    new EventItem({
        "item":item,
    }).addEvent("save", function(){
        var item=this;
        EventList.SharedInstance(function(el){
            
            el.addItem(item);
            
        });
    }), {
    "label":((item instanceof MyProfileItem)?<?php 
        
       echo json_encode(($ui=GetWidget('interfaceConfig'))->getParameter('label-for-create-event'));
    
        ?>:<?php 
        
       echo json_encode($ui->getParameter('label-for-item-create-event'));
    
    ?>).replace('{type}', item.getTypeName()),
    "formName":"eventForm",
    "formOptions":{
        "template":"form",
        "className":"event-form"
    },
    "className":"action-event"
}))