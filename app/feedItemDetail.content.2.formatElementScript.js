el.addClass('feed-item-actions')


EventItem.CreateActionButtons(item, application).forEach(function(b){
    el.appendChild(b);
})

el.appendChild(new Element('span', {"class":'item-toggle', events:{click:function(){
    
    

}}}));