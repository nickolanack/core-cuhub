childView.getElement().addClass((child.getType().split('.').pop())+'-feed-item');
childView.getElement().addClass('feed-item-'+child.getId());


if(child.isActive()){
   childView.getElement().addClass('active');
}

childView.addWeakEvent(child, "activate", function(){
   childView.getElement().addClass('active');
});

childView.addWeakEvent(child, "deactivate", function(){
   childView.getElement().removeClass('active');
});


childView.addWeakEvent(child, "archive", function(){
    childView.remove();
});

childView.addWeakEvent(child, "unpin", function(){
    childView.remove();
});

childView.addWeakEvent(child, "remove", function(){
    childView.remove();
});