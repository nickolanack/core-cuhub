el.addClass('feed-item-label count-posts');

(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', {
		                'plugin': "Discussions",
		                'itemType':item.getType(),
		                'item':item.getId(),
		                'channel':'default'
		                })).addEvent('success',function(resp){
		                    
		                    valueEl.innerHTML=resp.metadata.posts;
		                    
		                }).execute();