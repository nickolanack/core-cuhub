if((item instanceof ProfileItem)||(!item.canCreateConnectionFrom(EventList.SharedInstance().getClientProfile()))){
    return null;
}

return (new ModalFormButtonModule(application, 
    new ConnectionItem({
        "item":EventList.SharedInstance().getClientProfile(),
        "itemB":item.getOwnersProfile(),
    }).addEvent("save", function(){
        var item=this;
        EventList.SharedInstance(function(el){
            el.addItem(item);
        });
    }), {
    "label":(<?php 
        
       echo json_encode(($ui=GetWidget('interfaceConfig'))->getParameter('label-for-item-owner-connect'));
    
        ?>).replace('{type}', item.getTypeName()),
    "formName":"connectionForm",
    "formOptions":{
        "template":"form",
        "className":"connection-form"
    },
    "className":"action-connection action-user"
}))