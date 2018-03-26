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



	var ProfileQuery = new Class({
        Extends: AjaxControlQuery,
        initialize: function() {
            this.parent(CoreAjaxUrlRoot, 'users_profile', {
				plugin:"ProjectHub"
            });
        }
    });

	
	var EventList=new Class({
		Implements:[Events],
		initialize:function(){


			var me=this;
			me._clientsProfile

			if(AppClient.getUserType()=="guest"){
			    me._clientsProfile = new MyProfileItem();
			}else{

				(new ProfileQuery()).addEvent('success',function(response){
					me._clientsProfile =new MyProfileItem(response.result);
				}).execute();
				
			}



			(new FeedListQuery()).addEvent('success',function(resp){

				me._events=resp.results.map(function(data){

					var item = me._instantiateItem(data);
					me._addItemEvents(item);
					return item;
				});

				me._isLoaded=true;
				me.fireEvent('load');

				if(resp.subscription){
					Object.keys(resp.subscription).forEach(function(channel){

						AjaxControlQuery.Subscribe({channel:channel, event:resp.subscription[channel]}, function(result) {





                            	

                            	if(result.event==="deleted"){

                            		if(me.hasItem(result.item.id, result.item.type)){

                            			console.log('handled event '+result.event+": "+result.item.id+"=>"+result.item.type);
                            			me.removeItem(me.getItem(result.item.id, result.item.type));
                            			return;

                            		}
                            		console.log('ignored event '+result.event+": "+result.item.id+"=>"+result.item.type);
                            		return;
                            	}


                            	

                        		if(!me.hasItem(result.item.id, result.item.type)){
                        			console.log('handled event '+result.event+": "+result.item.id+"=>"+result.item.type);
                        			me.addItem(me._instantiateItem(result.item));
                        			return;
                        		}


                            	

                        		console.log('ignored event '+result.event+": "+result.item.id+"=>"+result.item.type);


                            });


					})
					
				}

			}).execute();

		},
		getClientProfile:function(){
			var me=this;
			if(!me._clientsProfile){
				throw 'Clients profile has not yet initialized';
			}
			return me._clientsProfile;

		},
		_instantiateItem:function(data){
			var me=this;

			var item=null;

			if(!(data&&data.type)){
				throw 'requires data.type'
			}

			if(data.type=="ProjectHub.profile"){
				item= new ProfileItem(data);
			}
			if(data.type=="ProjectHub.project"){
				item= new ProjectItem(data);
			}
			if(data.type=="ProjectHub.event"){
				item= new EventItem(data);
			}
			if(data.type=="ProjectHub.connection"){
				item= new ConnectionItem(data);
			}
			if(data.type=="ProjectHub.request"){
				item= new ConnectionRequestItem(data);
			}

			if(!item){
				throw 'unknown item type: '+data.type;
			}

			

			return item;

		},
		_addItemEvents:function(item){
			var me=this;

			item.addEvent('pin', function(){
				me.fireEvent('pinnedItem', [item]);
			});

			item.addEvent('unpin', function(){
				me.fireEvent('unpinnedItem', [item]);
			});

			item.addEvent('archive', function(){
				me.fireEvent('archivedItem', [item]);
			});

			item.addEvent('unarchive', function(){
				me.fireEvent('unarchivedItem', [item]);
			});

			item.addEvent('remove', function(){
				var i = me._events.indexOf(item);
				me._events.splice(i, 1);
				me.fireEvent('removeItem', [item]);
			});

		},
		hasItem:function(id, type){
			var me=this;
			for(var i=0;i<me._events.length;i++){
				if(me._events[i].isEqualTo(id, type)){
					return true;
				}
			}
			return false;
		},
		getItem:function(id, type){
			var me=this;
			for(var i=0;i<me._events.length;i++){
				if(me._events[i].isEqualTo(id, type)){
					return me._events[i];
				}
			}
			throw 'Does not contain item: '+id+' '+type;
		},
		addItem:function(item){

			var me=this;

			if(me.hasItem(item.getId(), item.getType())){
				return;
			}

			me._events.push(item);
			me._addItemEvents(item);
			me.fireEvent('addItem', [item]);

			console.log('added item: '+item.getId()+"=>"+item.getType());
			
			return this;
		},
		removeItem:function(item){
			var me=this;

			if(!me.hasItem(item.getId(), item.getType())){
				return;
			}

			item.remove();
			
			return this;


		},
		getAllEvents:function(){
			if(!this._events){
				throw 'Event feed not loaded yet';
			}
			return this._events.slice(0);
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
		},

		itemMatchesFilter:function(item, filter){

			if(filter.tags){


				return item.getTags().filter(function(n) {
	    			return filter.tags.indexOf(n) !== -1;
				}).length>0

			}

			if(filter.dates){

				if(item.hasEventDate()){
					return filter.dates.indexOf(item.getEventDateStr()) !== -1;
				}

	    		return item.hasDate()?filter.dates.indexOf(item.getDateStr()) !== -1:false;
			}

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



