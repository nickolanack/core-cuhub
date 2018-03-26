(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', {
		                'plugin': "Discussions",
		                'itemType':item.getType(),
		                'item':item.getId(),
		                'channel':'default'
		                })).addEvent('success',function(resp){
		                    
		                    callback(resp.metadata.post);
		                    
		                }).execute();