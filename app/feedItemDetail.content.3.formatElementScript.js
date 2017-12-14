el.addClass('feed-item-tags')
EventItem.CreateTagFilterButtons(item.getTags()).forEach(function(t){
    el.appendChild(t);
})
