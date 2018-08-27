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
			    me._loadFeedItems();
			}else{

				(new ProfileQuery()).addEvent('success',function(response){
					me._clientsProfile =new MyProfileItem(response.result);
					me._loadFeedItems();
				}).execute();
				
			}



			

		},
		_loadFeedItems:function(then){
			var me=this;
			var listHandler=function(resp){

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

			}

			if(window.FeedItemListResponse){
				setTimeout(function(){
					listHandler(window.FeedItemListResponse);
				},50);
			}else{
				(new FeedListQuery()).addEvent('success', listHandler).execute();
			}
			

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


EventList.DefaultTags=function(application){


			return ['engagement', 'software', 'hub', 'students', 'social media', 'analysis', 'community', 'research', 'mobile', 'spatial'];


	}

EventList.CreateNavigationController=function(labels, application){
	var labelContent=labels;
	var navigationController=(new NavigationMenuModule({
      "Main":[
        {
          "html":"Activity",
          "name":"FeedItems",
          "class":"menu-main-feeditems",
          "namedView":"bottomDetail",
          "labelContent":"Show All Recent Activity Feed Items",
           filterItem:function(item){
              return true; 
           }
        },
        {
          "html":"Events",
          "namedView":"bottomDetail",
          "labelContent":labelContent['label-for-events'],
           filterItem:function(item){
              return item.getType()==="ProjectHub.event";   
           }
        },
        {
          html:"Projects",
          "namedView":"bottomDetail",
          "labelContent":labelContent['label-for-projects'],
           filterItem:function(item){
              return item.getType()==="ProjectHub.project";   
           }
        },
        {
          html:"Connections",
          "namedView":"bottomDetail",
          "labelContent":labelContent['label-for-connections'],
           filterItem:function(item){
              return item.getType()==="ProjectHub.connection";   
           }
        },
         {
          html:"Profiles",
          "namedView":"bottomDetail",
          "labelContent":labelContent['label-for-profiles'],
           filterItem:function(item){
              return item.getType()==="ProjectHub.profile";   
           }
        },
        // {
        //   html:"Requests",
        //   "view":"bottomDetail",
        //   "labelContent":"user requests",
        //   filterItem:function(item){
        //       return item.getType()==="ProjectHub.request";   
        //   }
        // },
        {
          html:"Calendar"
        },
        {
          "html":"Tags",
          "namedView":"bottomDetail",
           filterItem:function(item){
              return EventList.SharedInstance().itemMatchesFilter(item, application.getNamedValue('tagFilter')); 
           },
           urlComponent:function(stub){
               var filter=application.getNamedValue('tagFilter');
               if(!filter){
                   return stub;
               }
               return stub+'/'+(filter.tags.length>1?'match-all/':"")+filter.tags.map(function(t){return t.split(' ').join('-'); }).join('/');
           }
        },
        {
          "html":"Date",
          "namedView":"bottomDetail",
           filterItem:function(item){
              return EventList.SharedInstance().itemMatchesFilter(item, application.getNamedValue('dateFilter')); 
           },
           urlComponent:function(stub){
               var filter=application.getNamedValue('dateFilter');
               if(!filter){
                   return stub;
               }
               return stub+'/'+(filter.dates.length>1?'match-any/':"")+filter.dates.map(function(t){return t.split(' ').join('-'); }).join('/');
           }
        },
        {
          html:"Archive"
        },
        {
          html:"Pinned"
        },
        {
          html:"Single",
        },
        {
          html:"About"
        },
        {
          html:"Contact"
        }
      ]   
        
    },{
        initialView:{"section":"Main", "view":"FeedItems"},
        targetUIView:function(button, section, viewer){
            return  viewer.getApplication().getChildView('content',0).getChildView('content',3)
        },
        templateView:function(button, section){
            return button.namedView||(section.toLowerCase()+button.html+"Detail");
        },
        buttonClass:function(button, section){
            return button["class"]||("menu-"+section.toLowerCase()+"-"+button.html.toLowerCase())
        },
        sectionClass:function(section){
            return "menu-"+section.toLowerCase()
        },
        formatEl:function(li, button){
            if(button&&button.labelContent){
                li.appendChild(new Element('label', {html:button.labelContent}));
            }
        }
    })).addEvent('navigationStart', function(button){
        application.setNamedValue('feedItemFilter', function(item){
            return button.filterItem?button.filterItem(item):true;
        });
    });
    
application.setNamedValue('navigationController', navigationController);
return navigationController;




};

EventList.CreateClearButton=function(application){

	if(application.getNamedValue('navigationController').getCurrentView().view=="FeedItems"){
	    return null;
	}

	return new ElementModule('button',{
	    html:"Show All",
	    events:{click:function(){
	        application.getNamedValue('navigationController').navigateTo("FeedItems", "Main");
	    }},
	    "class":"clear-filter form-btn"
	});
}

EventList.SearchAggregator = new Class({
    Extends: UISearchListAggregator,
    initialize: function(application, search, options) {
        var me=this;
        this.parent(search, Object.append({

            PreviousTemplate: UIListAggregator.PreviousTemplate,
            MoreTemplate: UIListAggregator.MoreTemplate,
            ResultTemplate: UIListAggregator.NamedViewTemplate(application, {
            	namedView:"eventFeedSearchItemDetail",
            	events:{
            		click:function(){
            			application.getNamedValue('navigationController').navigateTo("Single", "Main");
            		}
            	}
            })

        }, options));
    },
    _getRequest: function(filters) {
        var me = this;
        var string = me.currentSearchString;

        var args={
            search: string,
            searchOptions: filters
        };
        
        return new AjaxControlQuery(CoreAjaxUrlRoot, 'search', Object.append({'plugin':'ProjectHub'}, args));

     
    }
});


