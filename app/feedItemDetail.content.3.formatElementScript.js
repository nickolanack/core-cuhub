el.addClass('feed-item-tags')
EventItem.CreateTagFilterButtons(item).forEach(function(t){
    el.appendChild(t);
})
