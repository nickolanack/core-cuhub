/**
 * EventList is a singleton class that keeps track of the event objects 
 */

var EventList=(function(){



	var FeedListQuery = new Class({
        Extends: AjaxControlQuery,
        initialize: function() {
            this.parent(CoreAjaxUrlRoot, 'list_feed_items', {
                plugin: 'ProjectHub'
            });
        }
    });


	
	var EventList=new Class({
		Implements:[Events],
		initialize:function(){


			var me=this;
			(new FeedListQuery()).addEvent('success',function(resp){

				me._events=resp.results.map(function(data){

					if(!(data&&data.type)){
						throw 'requires data.type'
					}

					if(data.type=="ProjectHub.profile"){
						return new ProfileItem(data);
					}
					if(data.type=="ProjectHub.project"){
						return new ProjectItem(data);
					}
					if(data.type=="ProjectHub.event"){
						return new EventItem(data);
					}
					if(data.type=="ProjectHub.connection"){
						return new ConnectionItem(data);
					}
					if(data.type=="ProjectHub.request"){
						return new ConnectionRequestItem(data);
					}
					
					throw 'unknown item type: '+data.type;

				})

				me._isLoaded=true;
				me.fireEvent('load');
				
			}).execute();

		},
		getEvents:function(){
			if(!this._events){
				throw 'Event feed not loaded yet';
			}
			return this._events.filter(function(e){
				return (!e.isPinned())&&(!e.isArchived());
			});
		},
		getPinnedEvents:function(){
			return this._events.filter(function(e){
				return e.isPinned();
			});
		},
		getArchivedEvents:function(){
			return this._events.filter(function(e){
				return e.isArchived();
			});
		},
		runOnceOnLoad:function(fn){
			var me=this;
			if(me._isLoaded){
				fn(me);
			}else{
				me.addEvent('load:once', function(){
					fn(me);
				});
			}
			
			return me;
		}

	});

	var sharedInstance=null;

	return {
		SharedInstance:function(fn){
			if(!sharedInstance){
				sharedInstance=new EventList();
			}
			if(fn){
				sharedInstance.runOnceOnLoad(fn);
			}
			return sharedInstance;
		}
	};




})();



