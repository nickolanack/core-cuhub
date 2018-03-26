(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', {
		                'plugin': "Discussions",
		                'itemType':item.getType(),
		                'item':item.getId(),
		                'channel':'default'
		                })).addEvent('success',function(r){
		                    
		                    callback(r.count);
		                }).execute();