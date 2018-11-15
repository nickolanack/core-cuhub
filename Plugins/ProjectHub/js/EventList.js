/**
 * EventList is a singleton class that keeps track of the event objects 
 */

var EventList = (function() {

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
				plugin: "ProjectHub"
			});
		}
	});


	var EventList = new Class({
		Implements: [Events],
		initialize: function() {


			var me = this;
			me._clientsProfile

			if (AppClient.getUserType() == "guest") {
				me._clientsProfile = new MyProfileItem();
				me._loadFeedItems();
			} else {

				(new ProfileQuery()).addEvent('success', function(response) {
					me._clientsProfile = new MyProfileItem(response.result);
					me._loadFeedItems();
				}).execute();

			}



		},
		_loadFeedItems: function(then) {
			var me = this;
			var listHandler = function(resp) {

				me._events = resp.results.map(function(data) {

					var item = me._instantiateItem(data);
					me._addItemEvents(item);
					return item;
				});

				me._isLoaded = true;
				me.fireEvent('load');

				if (resp.subscription) {
					Object.keys(resp.subscription).forEach(function(channel) {

						AjaxControlQuery.Subscribe({
							channel: channel,
							event: resp.subscription[channel]
						}, function(result) {



							if (result.event === "deleted") {

								if (me.hasItem(result.item.id, result.item.type)) {

									console.log('handled event ' + result.event + ": " + result.item.id + "=>" + result.item.type);
									me.removeItem(me.getItem(result.item.id, result.item.type));
									return;

								}
								console.log('ignored event ' + result.event + ": " + result.item.id + "=>" + result.item.type);
								return;
							}



							if (!me.hasItem(result.item.id, result.item.type)) {
								console.log('handled event ' + result.event + ": " + result.item.id + "=>" + result.item.type);
								me.addItem(me._instantiateItem(result.item));
								return;
							}



							console.log('ignored event ' + result.event + ": " + result.item.id + "=>" + result.item.type);


						});


					})

				}

			}

			if (window.FeedItemListResponse) {
				setTimeout(function() {
					listHandler(window.FeedItemListResponse);
				}, 50);
			} else {
				(new FeedListQuery()).addEvent('success', listHandler).execute();
			}


		},
		getClientProfile: function() {
			var me = this;
			if (!me._clientsProfile) {
				throw 'Clients profile has not yet initialized';
			}
			return me._clientsProfile;

		},
		getProfileForUserId: function(id) {
			var me = this;
			for (var i = 0; i < me._events.length; i++) {
				if (me._events[i].getType()== "ProjectHub.profile"&&me._events[i].getAccountId()+""==id+"") {
					return me._events[i];
				}
			}
			return null;

		},
		_instantiateItem: function(data) {
			var me = this;

			var item = null;

			if (!(data && data.type)) {
				throw 'requires data.type'
			}

			if (data.type == "ProjectHub.profile") {
				item = new ProfileItem(data);
			}
			if (data.type == "ProjectHub.project") {
				item = new ProjectItem(data);
			}
			if (data.type == "ProjectHub.event") {
				item = new EventItem(data);
			}
			if (data.type == "ProjectHub.connection") {
				item = new ConnectionItem(data);
			}
			if (data.type == "ProjectHub.request") {
				item = new ConnectionRequestItem(data);
			}

			if (!item) {
				throw 'unknown item type: ' + data.type;
			}



			return item;

		},
		_addItemEvents: function(item) {
			var me = this;

			item.addEvent('pin', function() {
				me.fireEvent('pinnedItem', [item]);
			});

			item.addEvent('unpin', function() {
				me.fireEvent('unpinnedItem', [item]);
			});

			item.addEvent('archive', function() {
				me.fireEvent('archivedItem', [item]);
			});

			item.addEvent('unarchive', function() {
				me.fireEvent('unarchivedItem', [item]);
			});

			item.addEvent('remove', function() {
				var i = me._events.indexOf(item);
				me._events.splice(i, 1);
				me.fireEvent('removeItem', [item]);
			});

		},
		hasItem: function(id, type) {
			var me = this;
			for (var i = 0; i < me._events.length; i++) {
				if (me._events[i].isEqualTo(id, type)) {
					return true;
				}
			}
			return false;
		},
		getItem: function(id, type) {
			var me = this;
			for (var i = 0; i < me._events.length; i++) {
				if (me._events[i].isEqualTo(id, type)) {
					return me._events[i];
				}
			}
			throw 'Does not contain item: ' + id + ' ' + type;
		},
		addItem: function(item) {

			var me = this;

			if (me.hasItem(item.getId(), item.getType())) {
				return;
			}

			me._events.push(item);
			me._addItemEvents(item);
			me.fireEvent('addItem', [item]);

			console.log('added item: ' + item.getId() + "=>" + item.getType());

			return this;
		},
		removeItem: function(item) {
			var me = this;

			if (!me.hasItem(item.getId(), item.getType())) {
				return;
			}

			item.remove();

			return this;


		},
		getAllEvents: function() {
			if (!this._events) {
				throw 'Event feed not loaded yet';
			}
			return this._events.slice(0);
		},
		getEvents: function() {
			if (!this._events) {
				throw 'Event feed not loaded yet';
			}
			return this._events.filter(function(e) {
				return (!e.isArchived());
			});
		},
		getPinnedEvents: function() {
			return this._events.filter(function(e) {
				return e.isPinned();
			});
		},
		getArchivedEvents: function() {
			return this._events.filter(function(e) {
				return e.isArchived();
			});
		},
		runOnceOnLoad: function(fn) {
			var me = this;
			if (me._isLoaded) {
				fn(me);
			} else {
				me.addEvent('load:once', function() {
					fn(me);
				});
			}

			return me;
		},

		itemMatchesFilter: function(item, filter) {

			if (filter.tags) {


				return item.getTags().filter(function(n) {
					return filter.tags.indexOf(n) !== -1;
				}).length > 0

			}

			if (filter.dates) {

				if (item.hasEventDate()) {
					return filter.dates.indexOf(item.getEventDateStr()) !== -1;
				}

				return item.hasDate() ? filter.dates.indexOf(item.getDateStr()) !== -1 : false;
			}

		},

		getParentItems: function(item) {
			return item.getOwners();
		},
		getChildItems: function(item) {
			return item.getChildItems();
		},
		getActiveItems: function() {
			var me = this;
			var items = me.getEvents().filter(function(e) {
				return e.isActive();
			}).concat(
				me.getPinnedEvents().filter(function(e) {
					return e.isActive();
				})
			).concat(
				me.getArchivedEvents().filter(function(e) {
					return e.isActive();
				})
			)

			return items;

		}



	});



	var sharedInstance = null;

	return {
		SharedInstance: function(fn) {
			if (!sharedInstance) {
				sharedInstance = new EventList();
			}
			if (fn) {
				sharedInstance.runOnceOnLoad(fn);
			}
			return sharedInstance;
		}
	};



})();


EventList.DefaultTags = function(application) {


	return ['engagement', 'software', 'hub', 'students', 'social media', 'analysis', 'community', 'research', 'mobile', 'spatial'];


}

EventList.InitialView = function(application, callback) {

	application.getNamedValue('navigationController', function(controller) {
		var view = controller.getTemplateNameForView(controller.getCurrentView());

		callback(view);
	});

}

EventList.SetInitialFilter = function(application) {

	application.getNamedValue('navigationController', function(controller) {
		var button = controller.getButton(controller.getCurrentView());
		application.setNamedValue('feedItemFilter', function(item) {
			return button.filterItem ? button.filterItem(item) : true;
		});

		application.setNamedValue('feedItemMap', function(item) {
			return item;
		});

	});
}


EventList.FormatTagCloudModule=function(module, application){


	module.addEvent('selectWord',function(tag){
	    
	    application.setNamedValue('tagFilter',{tags:[tag]});
		application.getNamedValue('navigationController').navigateTo("Tags", "Main");
	    
	    
	});

	module.addEvent('addWord',function(tag, el){
	    
	    //if matches current tag, then highlight
	    el.addClass('btn-tag');
	    
	    
	    var current=application.getNamedValue('tagFilter');
		
		if(current&&current.tags&&current.tags.indexOf(tag)>=0){
		     el.addClass('active');
		}
	    
	})
};


EventList.FormatFieldLabel = function(el, application, view) {

	el.addClass("section-item-icon");
	el.addClass(view.toLowerCase() + '-label');
	el.addEvent('click', function(e) {

		if(view=="Pinned"){
			if (AppClient.getUserType() == "guest") {
				
				e.stop();
				var wizard = application.getDisplayController().displayPopoverForm(
					"loginForm",
					AppClient,
					{
						"template": "form"
					}
				);
				return;
					
			}
			
		}

		application.getNamedValue('navigationController').navigateTo(view, "Main");
	});


	if(view=="Pinned"){


		EventList.SharedInstance(function(elist){
			el.setAttribute('data-count-pins', elist.getPinnedEvents().length);
		});

		

		new WeakEvent(el, EventList.SharedInstance(), 'pinnedItem', function(feedItem){
			var item=el.appendChild(new Element('div',{"class":"added-pin"}));

			item.setAttribute('data-label',"Pinned "+feedItem.getName());
			el.setAttribute('data-count-pins', EventList.SharedInstance().getPinnedEvents().length);
			setTimeout(function(){
				item.setStyles({
					"top":-100,
					"opacity":0
				})
			}, 50);
			
			setTimeout(function(){
				el.removeChild(item);
			}, 2000);
		});

		new WeakEvent(el, EventList.SharedInstance(), 'unpinnedItem', function(feedItem){
			var item=el.appendChild(new Element('div',{"class":"removed-pin"}));

			item.setAttribute('data-label',"Unpinned "+feedItem.getName());
			el.setAttribute('data-count-pins', EventList.SharedInstance().getPinnedEvents().length);

			setTimeout(function(){
				item.setStyles({
					"top":-100,
					"opacity":0
				})
			}, 50);
			setTimeout(function(){
				el.removeChild(item);
			}, 2000);
		});

	}


}

EventList._AddWeakListRemoveEvents = function(childView, child, eventsList) {

	eventsList.forEach(function(event) {
		childView.addWeakEvent(child, event, function() {
			childView.remove();
		});
	});

	// childView.addWeakEvent(child, "archive", function() {
	// 	childView.remove();
	// });

	// childView.addWeakEvent(child, "unpin", function() {
	// 	childView.remove();
	// });

	// childView.addWeakEvent(child, "remove", function() {
	// 	childView.remove();
	// });

}
EventList._AddWeakListActivationEvents = function(childView, child) {

	if (child.isActive()) {
		childView.getElement().addClass('active');
	}

	// childView.addWeakEvent(child, "activate", function() {
	// 	childView.getElement().addClass('active');
	// });

	// childView.addWeakEvent(child, "deactivate", function() {
	// 	childView.getElement().removeClass('active');
	// });

}

EventList._AddExpandable = function(childView, child) {
	childView.getElement().addClass('expandable');
	EventList._AddAttributes(childView, child);
}

EventList._AddClassNames = function(childView, child) {
	childView.getElement().addClass((child.getType().split('.').pop()) + '-feed-item');
	childView.getElement().addClass('feed-item-' + child.getId());

	if(child instanceof ConnectionItem){
		childView.getElement().addClass((child.getConnectionTo().getType().split('.').pop()) + '-feed-item');
	}


}

EventList._ThinLayout = function(childView, child) {

	childView.getElement().addClass('thin-layout-item');

}
EventList._InsetLayout = function(childView, child) {

	childView.getElement().addClass('inset-layout-item');

}

EventList._ParentLayout = function(childView, child) {

	childView.getElement().addClass('parent-layout-item');

}

EventList._AddAttributes = function(childView, child) {
	childView.getElement().setAttribute('data-published-date', child.getDateFromNow());
}

EventList.FormatPinnedItemsFeedListChildModule = function(childView, child) {

	EventList._AddClassNames(childView, child);
	//EventList._ThinLayout(childView, child);
	//EventList._AddWeakListActivationEvents(childView, child);
	EventList._AddExpandable(childView, child);
	EventList._AddWeakListRemoveEvents(childView, child, ["archive", "unpin", "remove"]);

}

EventList.FormatArchivedItemsFeedListChildModule = function(childView, child) {

	EventList._AddClassNames(childView, child);
	//EventList._AddWeakListActivationEvents(childView, child);
	EventList._AddExpandable(childView, child);
	EventList._AddWeakListRemoveEvents(childView, child, ["unarchive", "pin", "remove"]);

}

EventList.FormatGenericItemFeedListChildModule = function(childView, child) {

	EventList._AddClassNames(childView, child);
	EventList._AddExpandable(childView, child);
	EventList._AddWeakListRemoveEvents(childView, child, ["archive", "remove"]);

}



EventList.FormatActiveItemFeedListChildModule = function(childView, child) {



	EventList._AddClassNames(childView, child);
	EventList._AddWeakListActivationEvents(childView, child);
	EventList._AddExpandable(childView, child);

	if (!child.isActive()) {

		EventList._ThinLayout(childView, child);
		if(EventItem.GetActiveItem().getOwners().indexOf(child)>=0){

			EventList._ParentLayout(childView, child);
			return;
		}

		
		EventList._InsetLayout(childView, child);
	}


	// childView.addWeakEvent(child, "remove", function(){
	//     childView.remove();
	// });

	//TODO: remove!

}





EventList.CurrentListLabel=function(app){

	var menu=EventList.Menu(app);
	if(menu){
		var view=menu.getCurrentView().view;
		if((['Events', 'Projects', 'Connections', 'Profiles']).indexOf(view)>=0){
			return "Project Hub Portal "+view;
		}
		if(view=='Tags'){
			var tags=app.getNamedValue('tagFilter').tags;
			return "Project Hub Portal Items With Tag"+(tags.length>1?"s":"")+": "+tags.join(", ");
		}
		return view;
	}

	return "Project Hub Portal Items";


}


EventList.Menu=function(app){
	return app.getNamedValue('navigationController');
}

EventList.CreateTopNavigation=function(application){


	var navigationController=new NavigationMenuModule({
      "header-menu":[
        {
          "html":"All Events",
          "name":"Events",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("Events", "Main");
              }
          },
          tagName:'span'
        },
        {
          html:"All Projects",
            name:"Projects",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("Projects", "Main");
              }
          },
          tagName:'span'
        },
        {
          html:"All Profiles",
           name:"Profiles",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("Profiles", "Main");
              }
          },
          tagName:'span'
        }
      ]   
        
    },{
        manipulateHistory:false
    });

	return navigationController;

	// var ul=new ElementModule('ul',{"class":"header-menu"});

	// var addView=function(view){
	//     ul.appendChild(new Element('li',{
	//         html:view,
	//         events:{click:function(){
	//             application.getNamedValue('navigationController').navigateTo(view, "Main");
	//         }}
	//     }));
	// }
	// var events=["Events", "Projects", "Connections", "Profiles"];
	// events.forEach(addView);

	// return ul;
}

EventList.CreateBottomNavigation=function(application){


	var navigationController=new NavigationMenuModule({
      "Site":[
        {
          "html":"Portal",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("FeedItems", "Main");
              }
          }
        },
        {
          html:"About",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("About", "Main");
              }
          }
        },
        {
          html:"Contact",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("Contact", "Main");
              }
          }
        },
        {
          html:"Archive",
          "events":{
              "click":function(){
                  application.getNamedValue('navigationController').navigateTo("Archive", "Main");
              }
          }
        }
      ]   
        
    },{
        manipulateHistory:false
    });
    
	//application.setNamedValue('navigationController', navigationController);
	return navigationController;

};



EventList.CreateNewFeedItemNavigation=function(application, parentWizard){

	
	var navigationController=new NavigationMenuModule({
      "Main":[
        {
			"html": "Create Event",
			"name": "Create",
			"class": "menu-main-feeditems create-new new-event",
			"namedView": "bottomDetail",
			"labelContent": "Create a new calendar event",
			events:{
				click:function(e){

					e.stop();
					parentWizard.close();
					
					var item=EventList.SharedInstance().getClientProfile();
					var formName ="eventForm";

					var wizard = application.getDisplayController().displayPopoverForm(
						formName,
						new EventItem({
					        "item":item,
					    }).addEvent("save", function(){
					        var item=this;
					        EventList.SharedInstance(function(el){
					            
					            el.addItem(item);
					            
					        });
					    }),
						{
							"template": "form",
							"className": "event-form"
						}
					);

				}
			}
		},
		{
			"html": "Create Project",
			"name": "Create",
			"class": "menu-main-feeditems create-new new-project",
			"namedView": "bottomDetail",
			"labelContent": "Create a new community/research project",
			events:{
				click:function(e){

					e.stop();
					parentWizard.close();

					var item=EventList.SharedInstance().getClientProfile();
					var formName ="projectForm";

					var wizard = application.getDisplayController().displayPopoverForm(
						formName,
						new ProjectItem({
						        "item":item,
						    }).addEvent("save", function(){
						        var item=this;
						        EventList.SharedInstance(function(el){
						            
						            el.addItem(item);
						            
						        });
						    }),
						{
							"template": "form",
							"className": "project-form"
						}
					);

				}
			}
		}
      ]   
        
    },
    {

        manipulateHistory:false,
        formatEl: function(li, button) {
			if (button && button.labelContent) {
				li.appendChild(new Element('label', {
					html: button.labelContent
				}));
			}
		}
    }
    );
    
	//application.setNamedValue('navigationController', navigationController);
	return navigationController;

};

EventList.PageDescription=function(state){


	var button=EventList._navigationController.getButton(state);
	if(button.description){

		if(typeof button.description=='function'){
			return button.description();
		}

		return button.description;
	}

	return JSON.stringify(state);


}

EventList.CreateNavigationController = function(labels, application) {
	var labelContent = labels;
	EventList._labels=labelContent;


	var loginGuest=function(config){

		if (AppClient.getUserType() == "guest") {
			config.events={
				click:function(e){
					e.stop();
					var wizard = application.getDisplayController().displayPopoverForm(
						"loginForm",
						AppClient,
						{
							"template": "form"
						}
					);
					return;
				}
			};
		}

		return config;

	}

	var navigationController = (new NavigationMenuModule({
		"Main": [{
				"html": "Create",
				"name": "Create",
				"class": "menu-main-feeditems create-new",
				"namedView": "bottomDetail",
				"labelContent": "Create",
				events:{
					click:function(){


						if (AppClient.getUserType() == "guest") {
							var wizard = application.getDisplayController().displayPopoverForm(
								"loginForm",
								AppClient,
								{
									"template": "form"
								}
							);
							return;
						}


						var item=EventList.SharedInstance().getClientProfile();
						if(!item.isPublished()){
			
							var formName = item.getType().split('.').pop() + "Form";

							var wizard = application.getDisplayController().displayPopoverForm(
								formName,
								item,
								{
									"template": "form",
									"className": item.getType().split('.').pop() + "-form"
								}
							);
							
							return;
						}

						var formName = "createItemsMenuForm";

						var wizard = application.getDisplayController().displayPopoverForm(
							formName,
							item,
							{
								"template": "form"
							}
						);


					}
				}
			},{
				"html": "Activity",
				"name": "FeedItems",
				"description":"Welcome to CUHub. We are pleased to create and share events, projects, connections, my communities",
				"class": "menu-main-feeditems",
				"namedView": "bottomDetail",
				"labelContent": "Show All Recent Activity Feed Items",
				filterItem: function(item) {
					return item.getType() !== "ProjectHub.connection";
				}
			}, loginGuest({
				"html": "Your Events",
				"name":"Events",
				"description":"These are the events taking place soon or took place recently",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-events'],
				filterItem: function(item) {
					return (item.getType() === "ProjectHub.event"&&item.clientOwns())||(item.getType() === "ProjectHub.connection"&&item.clientOwns()&&item.getConnectionTo().getType()=="ProjectHub.event");
				},
				urlComponent: function(stub, segments) {
					return 'Events/Yours'
				}
			}), loginGuest({
				"html": "Your Projects",
				"name":"Projects",
				"description":"These are the recent projects taking place in the community",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-projects'],
				filterItem: function(item) {
					return (item.getType() === "ProjectHub.project"&&item.clientOwns())||(item.getType() === "ProjectHub.connection"&&item.clientOwns()&&item.getConnectionTo().getType()=="ProjectHub.project");
				},
				urlComponent: function(stub, segments) {
					return 'Projects/Yours'
				}
			}), loginGuest({
				"html": "Your Connections",
				"class": "menu-main-connections hidden",
				"name":"Connections",
				"description":"These are your connections",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-connections'],
				filterItem: function(item) {
					return item.getType() === "ProjectHub.connection"&&item.clientOwns();
				},
				urlComponent: function(stub, segments) {
					return 'Connections/Yours'
				}
			}),loginGuest({
				"html": "Your Community",
				"name":"Profiles",
				"description":"These are your connections to community members",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-profiles'],
				filterItem: function(item) {
					return item.getType() === "ProjectHub.connection"&&item.clientOwns()&&item.getConnectionTo().getType()=="ProjectHub.profile";
				},
				map:function(item){
					return item.getConnectionTo();
				},
				urlComponent: function(stub, segments) {
					return 'Profiles/Yours'
				}
			}),{
				"html": "All Events",
				"name":"Events",
				"class": "menu-main-events hidden",
				"description":"These are the events taking place soon or took place recently",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-events'],
				filterItem: function(item) {
					return item.getType() === "ProjectHub.event";
				}
			}, {
				"html": "All Projects",
				"name": "Projects",
				"class": "menu-main-projects hidden",
				"description":"These are the recent projects taking place in the community",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-projects'],
				filterItem: function(item) {
					return item.getType() === "ProjectHub.project";
				}
			}, {
				"html": "Connections",
				"class": "menu-main-connections hidden",
				"name":"Connections",
				"description":"These are connections between members",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-connections'],
				filterItem: function(item) {
					return item.getType() === "ProjectHub.connection";
				}
			}, {
				"html": "Community",
				"class": "menu-main-profiles hidden",
				"name":"Profiles",
				"description":"These are other community members",
				"namedView": "bottomDetail",
				"labelContent": labelContent['label-for-profiles'],
				filterItem: function(item) {
					return item.getType() === "ProjectHub.profile";
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
				html: "Calendar",
				"class": "menu-main-calendar hidden"
			}, {
				"html": "Tags",
				"class": "menu-main-tags hidden",
				"namedView": "bottomDetail",
				filterItem: function(item) {
					return EventList.SharedInstance().itemMatchesFilter(item, application.getNamedValue('tagFilter'));
				},
				urlComponent: function(stub, segments) {

					if (segments && segments.length) {
						application.setNamedValue('tagFilter', {"tags":[segments[0]]});
					}

					var filter = application.getNamedValue('tagFilter');
					if (!filter) {
						return stub;
					}
					return stub + '/' + (filter.tags.length > 1 ? 'match-all/' : "") + filter.tags.map(function(t) {
						return t.split(' ').join('-');
					}).join('/');
				}
			}, {
				"html": "Date",
				"class": "menu-main-date hidden",
				"namedView": "bottomDetail",
				filterItem: function(item) {
					return EventList.SharedInstance().itemMatchesFilter(item, application.getNamedValue('dateFilter'));
				},
				urlComponent: function(stub, segments) {

					if (segments && segments.length) {
						application.setNamedValue('dateFilter', {"dates":[segments[0]]});
					}

					var filter = application.getNamedValue('dateFilter');
					if (!filter) {

						return stub;
					}
					return stub + '/' + (filter.dates.length > 1 ? 'match-any/' : "") + filter.dates.map(function(t) {
						return t.split(' ').join('-');
					}).join('/');
				}
			}, {
				html: "Archive",
				"class": "menu-main-archive hidden",
			}, {
				html: "Pinned",
				"class": "menu-main-pinned hidden"
			}, {
				html: "Single",
				"class": "menu-main-single hidden",
				urlComponent: function(stub, segments) {
					if (segments && segments.length) {

						EventList.SharedInstance(function(el) {
							
							if(segments[0]==="me"){
								segments[0]="profile-"+el.getClientProfile().getId();
							}

							var item = segments[0].split('-');
						
							if (el.hasItem(item[1], item[0])) {
								EventItem._application = application;
								EventList.SharedInstance().getItem(item[1], item[0]).activate();
							}
						});
					}
					return 'Single';
				}
			}, {
				html: "About",
				"class": "menu-main-about hidden"
			}, {
				html: "Contact",
				"class": "menu-main-contact hidden"
			}
		]

	}, {
		initialView: {
			"section": "Main",
			"view": "FeedItems"
		},
		targetUIView: function(button, section, viewer) {
			//return  viewer.getApplication().getChildView('content',0).getChildView('content',3)
			return viewer.getApplication().getNamedChildView("bottomDetail");
		},
		templateView: function(button, section) {
			return button.namedView || (section.toLowerCase() + (button.name||button.html) + "Detail");
		},
		buttonClass: function(button, section) {
			return button["class"] || ("menu-" + section.toLowerCase() + "-" + (button.name||button.html).toLowerCase())
		},
		sectionClass: function(section) {
			return "menu-" + section.toLowerCase()
		},
		formatEl: function(li, button) {
			if (button && button.labelContent) {
				li.appendChild(new Element('label', {
					html: button.labelContent
				}));
			}
		}
	})).addEvent('navigationStart', function(button) {

		application.setNamedValue('feedItemFilter', function(item) {
			return button.filterItem ? button.filterItem(item) : true;
		});

		application.setNamedValue('feedItemMap', function(item) {
			return button.map ? button.map(item) : item;
		});

	});

	application.setNamedValue('navigationController', navigationController);

	EventList._navigationController=navigationController;
	return navigationController;



};


EventList.CreateClearButton = function(application) {

	if (application.getNamedValue('navigationController').getCurrentView().view == "FeedItems") {
		return null;
	}

	return new ElementModule('button', {
		html: "Show All",
		events: {
			click: function() {
				application.getNamedValue('navigationController').navigateTo("FeedItems", "Main");
			}
		},
		"class": "clear-filter form-btn"
	});
}

if(window.UISearchListAggregator){
	
	EventList.SearchAggregator = new Class({
		Extends: UISearchListAggregator,
		initialize: function(application, search, options) {
			var me = this;
			this.parent(search, Object.append({

				PreviousTemplate: UIListAggregator.PreviousTemplate,
				MoreTemplate: UIListAggregator.MoreTemplate,
				ResultTemplate: UIListAggregator.NamedViewTemplate(application, {
					namedView: "eventFeedSearchItemDetail",
					events: {
						click: function() {
							application.getNamedValue('navigationController').navigateTo("Single", "Main");
						}
					}
				})

			}, options));
		},
		_getRequest: function(filters) {
			var me = this;
			var string = me.currentSearchString;

			var args = {
				search: string,
				searchOptions: filters
			};

			return new AjaxControlQuery(CoreAjaxUrlRoot, 'search', Object.append({
				'plugin': 'ProjectHub'
			}, args));


		}
	});

}