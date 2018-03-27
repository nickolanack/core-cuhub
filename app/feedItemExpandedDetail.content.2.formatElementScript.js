el.addClass('feed-item-tags')
EventItem.CreateTagFilterButtons(item, application).forEach(function(t){
    el.appendChild(t);
})