(new AjaxControlQuery(CoreAjaxUrlRoot, 'count_posts', {
		                'plugin': "Discussions",
		                'itemType':item.getType(),
		                'itemId':item.getId(),
		                'channel':'default'
		                })).addEvent('success',function(r){
		                    
		                    callback(r.count);
		                }).execute();