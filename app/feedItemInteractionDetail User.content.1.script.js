
return EventItem.CreateConnectionToOwnerProfileButton(item, application, <?php 
        
       echo json_encode(($ui=GetWidget('interfaceConfig'))->getParameter('label-for-item-owner-connect'));
    
        ?>);