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
		                         el.addClass('has-posts');
		                         valueEl.innerHTML=posts;
		                    }else{
		                        valueEl.innerHTML=""
		                    }
		                    
		                   
		                   if (resp.subscription) {
                            AjaxControlQuery.Subscribe(resp.subscription, function(result) {

                            	//console.log(item);
                            	//console.log(result);
                            	
                            	 posts++;
                            	 el.addClass('has-posts');
		                         valueEl.innerHTML=posts;
		                         
		                         if(item instanceof MyProfileItem){
		                              NotificationBubble.Make('', 'Someone just sent you a message');
		                         }

                            });


                           }
		                   
		                   
		                    
		                }).limit(1).execute();