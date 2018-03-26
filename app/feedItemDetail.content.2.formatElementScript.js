el.addClass('feed-item-label count-posts loading');

(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', {
		                'plugin': "Discussions",
		                'itemType':item.getType(),
		                'item':item.getId(),
		                'channel':'default'
		                })).addEvent('success',function(resp){
		                    var posts=resp.metadata.posts;
		                    el.removeClass('loading');
		                    if(posts>0){
		                         valueEl.innerHTML=resp.metadata.posts;
		                    }else{
		                        valueEl.innerHTML=""
		                    }
		                    
		                   
		                    
		                }).execute();