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


	var ConnectionListQuery = new Class({
		Extends: AjaxControlQuery,
		initialize: function() {
			this.parent(CoreAjaxUrlRoot, 'list_connections', {
				plugin: 'ProjectHub'
			});
		}
	});


	var KeepAlive=new Class({
		initialize:function(){
			setInterval(function(){
				(new AjaxControlQuery(CoreContentUrlRoot+'&format=ajax', 'echo', {"hello":"world"})).execute();
			}, 60000);
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
			me._events = [];
			me._clientsProfile;
			me._keepalive=new KeepAlive();

			if (AppClient.getUserType() == "guest") {
				me._clientsProfile = new MyProfileItem();
				me._loadFeedItems(function(){
					me._isLoaded = true;
					me.fireEvent('load');
				});
			} else {

				(new ProfileQuery()).addEvent('success', function(response) {
					me._clientsProfile = new MyProfileItem(response.result);
					me._loadFeedItems(function(){
						me._loadConnections(function(){
							me._isLoaded = true;
							me.fireEvent('load');
						});
					});
				}).execute();

			}



		},
		_loadConnections:function(callback){
			var me=this;
			var listHandler = function(resp) {

				resp.results.forEach(function(data) {

					var item = me._instantiateItem(data);

					if (me.hasItem(item)) {
						throw 'Already contains item';
					}

					me._addItemEvents(item);
					me._events.push(item);
				});

				
				if(callback){
					callback();
				}
			};

			(new ConnectionListQuery()).addEvent('success', listHandler).execute();
			
		},
		_loadFeedItems: function(callback) {
			var me = this;
			var listHandler = function(resp) {

				resp.results.forEach(function(data) {

					var item = me._instantiateItem(data);

					if (me.hasItem(item)) {
						throw 'Already contains item';
					}

					me._addItemEvents(item);
					me._events.push(item);
				});

				
				if(callback){
					callback();
				}
				

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
				if (me._events[i].getType() == "ProjectHub.profile" && me._events[i].getAccountId() + "" == id + "") {
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

			if (data.type == "ProjectHub.resource") {
				item = new ResourceItem(data);
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
				if (i >= 0) {
					me._events.splice(i, 1);
					me.fireEvent('removeItem', [item]);
				}
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

				var itemTags=item.getTags();

				//match all
				return filter.tags.filter(function(n){
					return itemTags.indexOf(n) !== -1;
				}).length==filter.tags.length;

				//match any
				return itemTags.filter(function(n) {
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
			var items = me.getAllEvents().filter(function(e) {
				return e.isActive();
			})

			return items;

		},



		

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







EventList._AddWeakListRemoveEvents = function(childView, child, eventsList) {

	eventsList.forEach(function(event) {
		childView.addWeakEvent(child, event, function() {
			childView.remove();
		});
	});


}
EventList._AddWeakListActivationEvents = function(childView, child) {

	if (child.isActive()) {
		childView.getElement().addClass('active');
	}


}

EventList._AddExpandable = function(childView, child) {

	childView.getElement().addClass('expandable');

	new UIPopover(childView.getElement(), {
		title: "click to view `" + child.getName() + "`",
		anchor: UIPopover.AnchorAuto()
	});

	EventList._AddAttributes(childView, child);

}

EventList._AddActiveItem = function(childView, child) {

	childView.getElement().addClass('expandable');
	EventList._AddAttributes(childView, child);

}

EventList._AddClassNames = function(childView, child) {
	CuhubDashboard.addFeedItemStyle(childView, child);
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
	EventList._AddActiveItem(childView, child);

	if (!child.isActive()) {

		EventList._ThinLayout(childView, child);
		if (CuhubDashboard.getActiveItem().getOwners().indexOf(child) >= 0) {

			EventList._ParentLayout(childView, child);
			return;
		}


		EventList._InsetLayout(childView, child);
	}

}


EventList.FormatFieldLabel = function(el, application, view) {

	CuhubDashboard.formatStickyTabLabel(el, view);
}

EventList.FormatTagCloudModule = function(module, application) {

	CuhubDashboard.formatTagCloudModule(module);
	
};



