var DashboardController = new Class({
	Implements:[Events],

	setApplication: function(application) {


		var me = this;
		me._application = application;
		return me;

	},
	getApplication: function() {

		var me = this;
		if (!me._application) {
			throw 'application not set';
		}
		return me._application;

	},

	getRootElement:function(){
		return $$('.ui-view.root-container')[0];
	},

	getNavigationController:function(callback) {
		var me=this;
		return me.getApplication().getNamedValue('navigationController', callback);
	},

	setLabels: function(labels) {
		var me = this;
		me._labels = labels;
	},

	getLabel: function(key) {
		var me = this;
		if (me._labels && me._labels[key]) {
			return me._labels[key];
		}
		return key;
	},

	getLabels: function() {
		var me = this;
		return me._labels;
	},

	getFeedItemBottomButtons: function(item) {

		var me = this;

		return [
			me.createDirectChatButton(item),
			me.createPinnedCounter(item),
			me.createConnectionCounter(item),
			me.createConnectionButton(item)
		];

	},
	createConnectionCounter:function(item){
		var module = new ElementModule('span', {"class":"count-followers"});
		var count=item.countConnectionsTo();
		if(count==0){
			module.getElement().addClass('empty');
		}
		module.getElement().setAttribute('data-follower-counter', count);
		return module;
	},
	createPinnedCounter:function(item){
		var module = new ElementModule('span', {"class":"count-pins"});
		var count=item.countPins();
		if(count==0){
			module.getElement().addClass('empty');
		}
		module.getElement().setAttribute('data-pins-counter', count);
		return module;
	},
	createConnectionButton: function(item) {


		var me = this;

		var defaultLabel = "Connect to this {type}";
		var fn = function() {

			if (item instanceof ConnectionItem) {
			
				try{
					item = item.getConnectionTo();
				}catch(e){
					console.error(e);
					return null;
				}

			}

			if (!item.canCreateConnectionFrom(EventList.SharedInstance().getClientProfile())) {
				return null;
			}

			if (item instanceof ResourceItem) {
				return null;
			}

			var hasConnection = item.hasConnectionFrom(EventList.SharedInstance().getClientProfile());


			var form = 'connectionForm';
			var className = "action-connection";
			var name = "Connected with " + item.getTypeName();
			var hover = "click to create a new connection with " + item.getName();

			var quickConnect = false;



			var label = defaultLabel.replace('{type}', item.getTypeName());
			var disconnectConfirm = "Are you sure you want to remove this connection"

			var ifConnection = function(a, b) {
				return hasConnection ? a : b;
			}

			if (item instanceof ProfileItem) {

				label = ifConnection("You Are Following ", "Follow ") + item.getName();
				form = 'connectWithUserForm';
				className = "action-profile";
				quickConnect = true;
				hover = "click to " + ifConnection("stop following ", "follow ") + item.getName();
				disconnectConfirm = "Are you sure you want to stop following " + item.getName();

			}



			if (item instanceof ProjectItem) {
				label = ifConnection("You Are Following ", "Follow ") + item.getName();
				className = "action-project";
				name = "Following " + item.getTypeName();
				hover = "click to " + ifConnection("stop following ", "follow ") + item.getName();
				quickConnect = true;
				disconnectConfirm = "Are you sure you want to stop following " + item.getName();
			}



			if (item.getType() == "ProjectHub.event") {
				label = ifConnection("You are Volunteering ", "Volunteer ");
				className = "action-event";
				form = 'connectWithEventForm';
				name = "Volunteering for " + item.getTypeName();
				hover = "click to " + ifConnection("stop volunteering ", "volunteer ") + " for " + item.getName();
				disconnectConfirm = "Are you sure you want to stop volunteering for" + item.getName();

			}



			if (AppClient.getUserType() == "guest") {

				var loginBtnModule = (new ModalFormButtonModule(me.getApplication(), AppClient, {
					"label": label,
					"formName": "loginForm",
					"formOptions": {
						"template": "form",
					},
					"className": className + " action-user action-for-" + item.getTypeName()
				}));
				new UIPopover(loginBtnModule.getElement(), {
					title: hover,
					anchor: UIPopover.AnchorAuto()
				});
				return loginBtnModule;
			}



			if (hasConnection) {
				var removeBtnModule = new ElementModule('button', {
					"class": className + " form-btn action-user action-for-" + item.getTypeName(),
					"html": label,
					"events": {
						"click": function() {
							EventItem.Confirm(disconnectConfirm, function(userAccepted) {
								if (userAccepted) {

									var connection = item.getConnectionFrom(EventList.SharedInstance().getClientProfile());
									connection.destroy(function() {
										connections.redraw();
									});

								}
							});
						}
					}
				});

				new UIPopover(removeBtnModule.getElement(), {
					title: hover,
					anchor: UIPopover.AnchorAuto()
				});
				return removeBtnModule;
			}


			var newConnection = (new ConnectionItem({
				"item": EventList.SharedInstance().getClientProfile(),
				"itemB": item,
				"name": name
			})).addEvent("save", function() {
				EventList.SharedInstance(function(el) {
					el.addItem(newConnection);
					connections.redraw();
				});
			})


			if (quickConnect) {
				var quickBtnModule = new ElementModule('button', {
					"class": className + " form-btn action-user action-for-" + item.getTypeName(),
					"html": label,
					"events": {
						"click": function() {
							newConnection.save()
						}
					}
				});

				new UIPopover(quickBtnModule.getElement(), {
					title: hover,
					anchor: UIPopover.AnchorAuto()
				});
				return quickBtnModule;
			}


			var formBtnModule = new ModalFormButtonModule(me.getApplication(),
				newConnection, {
					"label": label,
					"formName": form,
					"formOptions": {
						"template": "form",
						"className": "connection-form " + (item.getTypeName().toLowerCase()) + "-form"
					},
					"className": className + " action-user action-for-" + item.getTypeName()
				}
			)

			new UIPopover(formBtnModule.getElement(), {
				title: hover,
				anchor: UIPopover.AnchorAuto()
			});
			return formBtnModule;


		};


		var connections = new ModuleArray([fn]);
		return connections;


	},

	createDirectChatButton: function(item) {

		var me = this;

		if (item instanceof ConnectionItem) {
			item = item.getConnectionTo();
		}

		if ((!item.canCreateConnectionFrom(EventList.SharedInstance().getClientProfile())) || !(item instanceof ProfileItem)) {
			return null;
		}

		label = "Message " + item.getName();


		if (AppClient.getUserType() == "guest") {

			var GuestContact = new Class({
				Extends: MockDataTypeItem,
				initialize: function(options) {
					var me = this;
					me.parent(options);
					me.setEmail = function(email) {
						options.email = email;
					}
					me.setMessage = function(message) {
						options.message = message;
					}
				},
				save: function(cb) {

					var me = this;
					(new AjaxControlQuery(CoreAjaxUrlRoot, 'send_direct_message', {
						'plugin': "ProjectHub",
						'email': me.getEmail(),
						'message': me.getMessage(),
						'itemId': item.getId(),
						'itemType': item.getType()
					})).addEvent('success', function() {
						NotificationBubble.Make('', 'A verification email has been sent');
						cb(true);
					}).execute();
				}
			})

			return (new ModalFormButtonModule(me.getApplication(),
				(new GuestContact({
					"email": "",
					"message": ""
				})), {
					"label": label,
					"formName": "contactForm",
					"formOptions": {
						"template": "form",
						"className": "contact-form"
					},
					"className": "action-contact action-profile action-user action-for-" + item.getTypeName()
				})).addEvent('complete', function(item) {

				console.log()


			});

		}


		//var client=EventList.SharedInstance().getClientProfile();

		return (new ModalFormButtonModule(me.getApplication(),
			item, {
				"label": label,
				"formName": "directChatForm",
				"formOptions": {
					"template": "form",
					"className": "contact-form"
				},
				"className": "action-contact action-profile action-user action-for-" + item.getTypeName()
			}));


	},

	createConnectionToOwnerProfileButton: function(item) {

		var me = this;

		if ((item instanceof ProfileItem) || (!item.canCreateConnectionFrom(EventList.SharedInstance().getClientProfile()))) {
			return null;
		}

		return (new ModalFormButtonModule(me.getApplication(),
			new ConnectionItem({
				"item": EventList.SharedInstance().getClientProfile(),
				"itemB": item.getOwnersProfile(),
			}).addEvent("save", function() {
				var item = this;
				EventList.SharedInstance(function(el) {
					el.addItem(item);
				});
			}), {
				"label": "Follow " + item.getName(),
				"formName": "connectionForm",
				"formOptions": {
					"template": "form",
					"className": "connection-form"
				},
				"className": "action-connection action-user"
			}))

	},



	createMapTileUrl: function(item) {

		if (item.getType() != "ProjectHub.event") {
			return null;
		}



		var staticMap = new ElementModule('div', {
			"class": "static-map"
		});



		var setLocationData = function() {

			staticMap.getElement().innerHTML = '';
			staticMap.getElement().addClass('no-location');

			if (!(item.config.attributes && item.config.attributes.location)) {
				staticMap.getElement().setStyle(
					"background-image", null);
				return;
			}
			staticMap.getElement().removeClass('no-location');


			staticMap.getElement().setStyle(
				"background-image",
				"url(//maps.googleapis.com/maps/api/staticmap?center=" + encodeURIComponent(item.config.attributes.location) + "&size=2000x2000&maptype=roadmap&key=AIzaSyDGrfhOSrI0ziT_1DoGPyu7Z1vJaz-v9pU)"
			);


			staticMap.getElement().appendChild(new Element('a', {
				"class": "map-location",
				"href": 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(item.config.attributes.location),
				"html": item.config.attributes.location,
				"target": "_blank"
			}))
		};

		var setTimeData = function() {
			staticMap.getElement().addClass('no-time');

			if (item.hasEventDate()) {
				staticMap.getElement().removeClass('no-time');
				staticMap.getElement().appendChild(new Element('p', {
					"class": "event-time",
					"html": item.getEventDateFormatted()
				}));
			}



		}

		staticMap.addWeakEvent(item, 'save', function() {
			setLocationData();
			setTimeData();
		});
		setLocationData();
		setTimeData();

		return staticMap;

	},

	appendFeedItemActions: function(el, item) {

		var me = this;

		el.addClass('feed-item-actions')

		me.createActionButtons(item).forEach(function(b) {
			el.appendChild(b);
		});


	},

	createActionButtons: function(item) {


		var me = this;



		if (!EventItem.Confirm) {
			EventItem.Confirm = function(question, callback) {

				(new UIModalDialog(me.getApplication(), question, {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "confirm-view"
					}
				})).show(callback);
			}

			EventItem.Alert = function(question, callback) {

				(new UIModalDialog(me.getApplication(), question, {
					"formName": "dialogForm",
					"formOptions": {
						"template": "form",
						"className": "alert-view"
					}
				})).show(callback);

			}

		}

		var fn = function() {
			return new ModuleArray(item.getActions().map(function(action) {



				return new ElementModule('button', {
					"class": "btn-action action-" + action + (action == "delete-disabled" ? " action-delete" : ""),
					title: action,
					events: {
						click: function(e) {
							e.stop();
							if ((item[action] && typeof item[action] == 'function') || action === 'login') {

								if (AppClient.getUserType() == "guest") {
									var wizard = me.getApplication().getDisplayController().displayPopoverForm(
										"loginForm",
										AppClient,
										me.getApplication(), {
											"template": "form"
										}
									);
									return;
								}

								actions.addWeakEvent(item, action + ":once", function() {
									actions.redraw();
								});

								item[action](function() {

								});

								return;
							}


							if (action === 'edit') {

								var formName = item.getType().split('.').pop() + "Form";

								var wizard = me.getApplication().getDisplayController().displayPopoverForm(
									formName,
									item,
									me.getApplication(), {
										"template": "form",
										"className": item.getType().split('.').pop() + "-form"
									}
								);

								return;
							}

							if (action === 'delete') {


								EventItem.Confirm(
									"Are you sure you want to delete this item",
									function(userAccepted) {

										if (userAccepted) {
											item.destroy(function(){
												me.getNavigationController().navigateTo("FeedItems", "Main");		
											});
										}

									});



								return;
							}

							if (action === 'delete-disabled') {

								EventItem.Alert(
									"Unable to do this",
									function(userAccepted) {

									});


								return;
							}

							if (action === 'focus') {

								me.getNavigationController().navigateTo("FeedItems", "Main");

								return;
							}

							console.warn('item does not define function named: ' + action);

						}
					}
				});
			}))
		};


		var actions = new ModuleArray([fn]);

		var container = new Element('span');
		actions.load(null, container, null);
		return [container];

	},



	createFeedItemSubChildButtons: function(item) {


		var me = this;

		if (item.getType() == "ProjectHub.profile" && item.clientOwns() && !(item instanceof MyProfileItem)) {
			item = EventList.SharedInstance().getClientProfile();
		}

		var buttonset = [];


		var isMyProfile = function() {
			return !!(item instanceof MyProfileItem);
		}

		if (item.canCreate('event')) {

			buttonset.push((new ModalFormButtonModule(me.getApplication(),
				new EventItem({
					"item": item,
				}).addEvent("save", function() {
					var item = this;
					EventList.SharedInstance(function(el) {

						el.addItem(item);

					});
				}), {
					"label": me.getLabel(isMyProfile(item) ? 'label-for-create-event' : 'label-for-item-create-event').replace('{type}', item.getTypeName()),
					"formName": "eventForm",
					"formOptions": {
						"template": "form",
						"className": "event-form"
					},
					"className": "action-event"
				})));
		}



		if (item.canCreate('project')) {


			buttonset.push((new ModalFormButtonModule(me.getApplication(),
				new ProjectItem({
					"item": item,
				}).addEvent("save", function() {
					var item = this;
					EventList.SharedInstance(function(el) {

						el.addItem(item);

					});
				}), {
					"label": me.getLabel(isMyProfile(item) ? 'label-for-create-project' : 'label-for-item-create-project').replace('{type}', item.getTypeName()),
					"formName": "projectForm",
					"formOptions": {
						"template": "form",
						"className": "project-form"
					},
					"className": "action-project"
				})));


		}


		if (false && item.canCreate('connection')) {



			buttonset.push((new ModalFormButtonModule(me.getApplication(),
				new ConnectionItem({
					"item": item,
				}).addEvent("save", function() {
					var item = this;
					EventList.SharedInstance(function(el) {

						el.addItem(item);

					});
				}), {
					"label": me.getLabel(isMyProfile(item) ? 'label-for-create-connection' : 'label-for-item-create-connection').replace('{type}', item.getTypeName()),
					"formName": "connectionForm",
					"formOptions": {
						"template": "form",
						"className": "connection-form"
					},
					"className": "action-connection"
				})));

		}


		if (!item.isPublished()) {
			return null;

			buttonset.push((new ModalFormButtonModule(me.getApplication(),
				item, {
					"label": "Publish your profile",
					"formName": "profileForm",
					"formOptions": {
						"template": "form",
						"className": "profile-form"
					},
					"className": "action-profile",
					events: {
						click: function() {
							item.setPublished(true);
						}
					}
				})));

		}

		if (buttonset.length == 0) {
			return null;
		}
		return buttonset;

	},



	formatItemLabel: function(item, el, valueEl) {

		var me = this;

		el.addClass('feed-item-label');


		if (item instanceof ConnectionItem) {

			if (item.isConnected()) {
				try{
					var connectedTo = item.getConnectionTo();
				}catch(e){
					console.error(e);
					return;
				}
				valueEl.appendChild(new Element('span', {
					"class": "item-connection-to",
					html: " " + connectedTo.getName()
				}));


				item = connectedTo;

			} else {
				valueEl.appendChild(new Element('span', {
					"class": "item-connection-to",
					html: " {not connected}"
				}));
			}



		}



		if (item instanceof MyProfileItem && AppClient.getUserType() == "guest") {
			return;
		}



		if (item instanceof MyProfileItem) {

			valueEl.appendChild(new Element('span', {
				"class": "item-author",
				html: ' ' + "your profile"
			}));
			el.addClass('your-profile-label');

			valueEl.addEvent('click', function(e) {
				e.stop();
				var nav = me.getNavigationController();
				var profile = EventList.SharedInstance().getItem(item.getId(), item.getType());
				if (profile.isActive() && nav.getCurrentView().view == "Single") {
					return;
				}

				profile.activate();
				nav.navigateTo("Single", "Main");
			});

			new UIPopover(valueEl, {
				title: "click to go to your profile",
				anchor: UIPopover.AnchorTo(["bottom"]),
				className: 'popover tip-wrap hoverable onblack'
			});

			return;

		}



		if (item.getType() === "ProjectHub.event") {

			if (item.hasEventDate()) {

				valueEl.appendChild(new Element('span', {
					"class": "event-date-from-now",
					html: ' ' + item.getEventDateFromNow()
				}));

			}

		}



		if (item.hasOwner() && item.showsOwner()) {
			try {
				var owner = item.getOwnersProfile();
				var userEl = valueEl.appendChild(me.createAuthorLabel(owner));
			} catch (e) {
				console.error(e);
			}


		}



		valueEl.appendChild(new Element('span', {
			"class": "date-from-now",
			html: (item.hasDate() ? ' ' + item.getDateFromNow() : "")
		}));



	},

	getItemLabelValue: function(item) {
		if (item instanceof MyProfileItem && AppClient.getUserType() == "guest") {
			return "You are not logged in"
		}

		var str = (item.getName ? item.getName() : "{name}");

		return str;
	},

	formatDefaultPost: function(item, el, valueEl) {

		var me = this;

		el.addClass('post-author')

		var id = item.getUserId();
		el.addClass('user-id-' + id);
		if (id <= 0) {
			return;
		}
		var user = EventList.SharedInstance().getProfileForUserId(id);
		if (user) {
			valueEl.appendChild(me.createAuthorLabel(user, me.getApplication()));
		}


	},


	formatPrivateDiscussion: function(el, valueEl, item) {

		var me = this;

		el.addClass('post-author private-chat feed-item-label')

		var id = item.getId();
		el.addClass('user-id-' + id);
		if (id <= 0) {
			return;
		}
		var user = item;
		if (user) {
			valueEl.appendChild(CuhubDashboard.createAuthorLabel(user))
		}

		el.parentNode.addEvent("click", function() {


			me.getApplication().getDisplayController().displayPopoverForm(
				"directChatForm",
				user, {
					"template": "form",
					"className": "contact-form"
				}
			);


		});


	},

	createAuthorLabel: function(owner) {

		var me = this;

		var userEl = new Element('span', {
			"class": "item-author",
			html: " " +
				(owner.isEqualTo(EventList.SharedInstance().getClientProfile()) ? "You" : owner.getName())
		});


		new UIPopover(userEl, {
			title: "click to go to " + (owner.isEqualTo(EventList.SharedInstance().getClientProfile()) ? "Your" : owner.getName() + "'s") + " profile",
			anchor: UIPopover.AnchorAuto()
		});

		userEl.addEvent('click', function(e) {
			e.stop();
			var nav = me.getNavigationController();
			if (owner.isActive() && nav.getCurrentView().view == "Single") {
				return;
			}

			owner.activate();
			nav.navigateTo("Single", "Main");
		});


		var icon = new Element('div', {
			"class": "feed-item-icon user-icon"
		});

		if (owner.hasIcon()) {
			//icon.addClass('user-icon');
			icon.setStyle("background-image", "url('" + owner.getIcon() + "?thumb=>60x>60')");
		}

		userEl.appendChild(icon);
		return userEl;

	},



	formatDiscussionCounters: function(el, valueEl, item) {


		var me = this;

		el.addClass('feed-item-label count-posts loading');



		(new AjaxControlQuery(CoreAjaxUrlRoot, 'discussion_metadata', {
			'plugin': "Discussions",
			'itemType': item.getType(),
			'item': item.getId(),
			'channel': me._getDiscussionChannel(item, 'default')
		})).addEvent('success', function(resp) {
			var posts = resp.metadata.posts;
			var newPosts = resp.metadata.new;
			el.removeClass('loading');
			if (posts > 0) {
				el.addClass('has-posts');
				valueEl.setAttribute('data-posts-count', posts);
				//valueEl.setAttribute('data-posts-last', moment((new Date(resp.metadata)).valueOf() + CoreServerDateOffset).fromNow()
				valueEl.innerHTML = posts + " post" + (posts == 1 ? "" : "s");
				valueEl.setAttribute('data-posts-new', newPosts);

			} else {
				valueEl.innerHTML = ""
			}

			if (AppClient.getUserType() !== "guest" && newPosts > 0) {
				el.addClass('has-new-posts');
			}


			if (resp.subscription) {
				AjaxControlQuery.Subscribe(resp.subscription, function(result) {

					//console.log(item);
					//console.log(result);

					posts++;

					if (AppClient.getId() != result.user) {
						newPosts++;
					}



					if (AppClient.getUserType() !== "guest" && newPosts == 1) {
						el.addClass('has-new-posts');
					}
					el.addClass('has-posts');
					valueEl.setAttribute('data-posts-count', posts);
					valueEl.setAttribute('data-posts-new', newPosts);
					valueEl.innerHTML = posts + " post" + (posts == 1 ? "" : "s");

					if (item instanceof MyProfileItem) {
						NotificationBubble.Make('', 'Someone just sent you a message');
					}

				});


			}



		}).limit(1).execute();



	},


	_getDiscussionChannel: function(item, defaultChannel) {


		if (item instanceof ProfileItem) {
			var ids = ([item.getId(), EventList.SharedInstance().getClientProfile().getId()]).sort();
			return "direct-" + ids.join("-");
		}


		return defaultChannel;
	},



	createItemIcon: function(item) {

		var me = this;

		var icon = new ElementModule('div', {
			"class": "feed-item-icon"
		});

		if (item.hasIcon()) {
			icon.getElement().addClass('user-icon');
			icon.getElement().setStyle("background-image", "url('" + item.getIcon() + "?thumb=>60x>60')");
		}

		if (item instanceof ConnectionItem && item.isConnected()) {
			var connectedTo = item.getConnectionTo();
			if (connectedTo.hasIcon()) {
				icon.getElement().addClass('user-icon connection-icon');
				icon.getElement().setStyle("background-image", "url('" + connectedTo.getIcon() + "?thumb=>60x>60')");

				icon.getElement().appendChild(new Element('div', {
					"class": "feed-item-icon"
				}))
			}
		}

		if (item.getType() === "ProjectHub.event" && item.hasEventDate()) {
			icon.getElement().setAttribute('data-event-day', item.getEventDay());
		}


		if (item instanceof MyProfileItem) {
			icon.getElement().addEvent('click', function(e) {

				e.stop();

				if (!item.isPublished()) {


					if (AppClient.getUserType() == "guest") {
						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							"loginForm",
							AppClient,
							me.getApplication(), {
								"template": "form"
							}
						);
						return;
					}


					var formName = item.getType().split('.').pop() + "Form";

					var wizard = me.getApplication().getDisplayController().displayPopoverForm(
						formName,
						item,
						me.getApplication(), {
							"template": "form",
							"className": item.getType().split('.').pop() + "-form"
						}
					);


					return;
				}

				//EventList.SharedInstance(function(el){
				//resolve profile item!
				//
				var feeditem = EventList.SharedInstance().getItem(item.getId(), item.getType());
				var nav = me.getNavigationController();
				if (feeditem.isActive() && nav.getCurrentView().view == "Single") {
					return;
				}

				feeditem.activate();
				nav.navigateTo("Single", "Main");
				//})

			});
		}


		return icon;



	},


	appendTagFilterButtons: function(el, item) {

		var me = this

		el.addClass('feed-item-tags')
		var empty=true;
		me.createTagFilterButtons(item).forEach(function(t) {
			el.appendChild(t);
			empty=false;
		});

		if(empty&&(!(item instanceof ProfileItem))){
			el.appendChild(new Element('span',{"class":"empty-tags", html:"there are no tags for this item"}));
		}

	},

	

	setActiveItem: function(item) {

		var me = this

		if (me._activeItem && item !== me._activeItem) {
			me.clearActiveItem();
		}
		me.getNavigationController().addUrlSegment(item.getType().split('.').pop() + '-' + item.getId());
		me._activeItem = item;
	},
	clearActiveItem: function() {

		var me = this
		if (me._activeItem) {
			if (me._activeItem.isActive()) {

				me.getNavigationController().removeUrlSegment(me._activeItem.getType().split('.').pop() + '-' + me._activeItem.getId());

				me._activeItem.deactivate();
			}
			me._activeItem = null;
		}
	},

	getActiveItem: function() {

		var me = this
		if (me._activeItem) {
			return me._activeItem;
		}
		return null;
	},



	defaultItemTags: function(item) {

		var me = this;


		if (item && item instanceof ResourceItem) {
			return [
				"Grant writing",
				"Research Ethics",
				"Research Planning",
				"Research Methods"
			]
		}

		return [
			'engagement',
			'software',
			'hub',
			'students',
			'social media',
			'analysis',
			'community',
			'research',
			'mobile',
			'spatial'
		];

	},


	createTagBtn: function(tag, options) {

		return new Element('button', Object.append({
			"class": "btn-tag tag-" + tag,
			"html": tag,
			"title": tag
		}, options));
	},

	setTagFilter:function(tags){

		var me=this;
		var currentTags=me.getTags().slice(0).sort();

		if(JSON.stringify(tags.sort())===JSON.stringify(currentTags)){
			return;
		}

		me.getApplication().setNamedValue('tagFilter', {
			"tags": tags
		});

		me.fireEvent('setTags', tags.slice(0));

		if (tags.length) {
			me.getNavigationController().navigateTo("Tags", "Main");
			return;
		}

		me.getNavigationController().navigateTo("FeedItems", "Main");
	},

	addTagFilter:function(tags){
		if(typeof tags=="string"){
			tags=[tags];
		}

		var me=this;
		var tagFilter = me.getTags().slice(0);
		tags.forEach(function(tag){
			if(!me.hasTagFilter(tag)){
				tagFilter.push(tag);
			}
		});

		me.setTagFilter(tagFilter);

	},
	removeTagFilter:function(tags){
		if(typeof tags=="string"){
			tags=[tags];
		}

		var me=this;
		var tagFilter = me.getTags().slice(0);
		tags.forEach(function(tag){
			var i = tagFilter.indexOf(tag);
			if (i >= 0) {
				tagFilter.splice(i, 1);
			}
		});

		me.setTagFilter(tagFilter);
	},

	getTags:function(){
		var me=this;
		var tagFilter = me.getApplication().getNamedValue('tagFilter');
		if(tagFilter&&tagFilter.tags){
			return tagFilter.tags;
		}
		return [];
	},
	countTags:function(){
		return this.getTags().length;
	},
	hasTagFilter:function(tag){

		var me=this;
		var tags = me.getTags();
		var i = tags.indexOf(tag);
		if (i >= 0) {
			return true;
		}
		return false;
	},

	createTagBtnsClearCurrent:function(btns){

		var me=this;

		me.getApplication().getNamedValue('tagFilter').tags.forEach(function(tag) {
			btns.appendChild(CuhubDashboard.createTagBtn(tag, {
				events: {
					click: function(e) {
						e.stop();
						me.removeTagFilter(tag);
					}
				}
			}));
		})
	},

	createTagFilterButtons: function(item) {

		var me = this;

		var tagList = item.getTags();

		return tagList.map(function(tag) {

			var current = me.getApplication().getNamedValue('tagFilter');
			activeClass = '';
			isActive = false;
			if (current && current.tags && current.tags.indexOf(tag) >= 0) {
				activeClass = ' active';
				isActive = true;
			}

			var btn = me.createTagBtn(tag, {
				events: {
					click: function(e) {
						e.stop();
						me.addTagFilter(tag);
					}
				}
			});
			btn.addClass(activeClass);


			if (isActive) {
				new UIPopover(btn, {
					title: "this tag matches the current filter: `" + tag + "`",
					anchor: UIPopover.AnchorAuto()
				});
			} else {
				new UIPopover(btn, {
					title: "click show all other items tagged with: `" + tag + "`",
					anchor: UIPopover.AnchorAuto()
				});
			}



			return btn;
		});

	},


	formatTagCloudModule:function(module) {


		var me=this;

		var cloud = module.getCloud();
		var popoverMap = {};

		var selection = [];
		var singleSelection = true;


		var activateTag=function(tag, el){

			el.addClass('active');
			setPopover(tag, "click to remove tag filter: `" + tag + "`");

		}
		var deactivateTag=function(tag, el){

			el.removeClass('active');
			setPopover(tag, "click to show all items tagged with: `" + tag + "`", el);
			
		}

		var setPopover=function(tag, value, el){
			if(!popoverMap[tag]){

				if(!el){
					throw 'need el';
				}
				popoverMap[tag] = new UIPopover(el, {
					title: value,
					anchor: UIPopover.AnchorAuto()
				});

				return;
			}
			popoverMap[tag].setTitle(value);
		}


		module.addEvent('selectWord', function(tag) {


			if(me.hasTagFilter(tag)){
				me.removeTagFilter(tag);
				return;
			}
			me.addTagFilter(tag);
			return;

		});

		module.addEvent('addWord', function(tag, el) {

			//if matches current tag, then highlight
			el.addClass('btn-tag');
			deactivateTag(tag, el);
			if(me.hasTagFilter(tag)){
				activateTag(tag, el);
			}

		})

		module.addWeakEvent(me, 'setTags', function(tags){
			cloud.getWords().forEach(function(tag){
				var el=cloud.getWordElement(tag);
				if(!el){
					return;
				}
				if(me.hasTagFilter(tag)){
					activateTag(tag, el);
					return;
				}
				deactivateTag(tag, el);
			});
		});

	},




	createNavigationController: function() {


		var me = this;

		labelContent = me.getLabels();

		var loginGuest = function(config) {

			if (AppClient.getUserType() == "guest") {
				config.events = {
					click: function(e) {
						e.stop();
						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							"loginForm",
							AppClient, {
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
					"html": "Activity",
					"name": "FeedItems",
					"hover": "click to clear any filters and display all projects and events",
					"description": "Welcome to CUHub. We are pleased to create and share events, projects, connections, my communities",
					"class": "menu-main-feeditems",
					"namedView": "bottomDetail",
					"labelContent": "Show All Recent Activity Feed Items",
					filterItem: function(item) {
						return item.getType() !== "ProjectHub.connection" && item.getType() !== "ProjectHub.profile";
					}
				}, loginGuest({
					"html": "Your Events",
					"name": "Events",
					"hover": "click to show all of your events and events you're connected to",
					"description": "These are the events taking place soon or took place recently",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-events'],
					filterItem: function(item) {
						return (item.getType() === "ProjectHub.event" && item.clientOwns()) || (item.getType() === "ProjectHub.connection" && item.clientOwns() && item.getConnectionTo().getType() == "ProjectHub.event");
					},
					urlComponent: function(stub, segments) {
						return 'Events/Yours'
					}
				}), loginGuest({
					"html": "Your Projects",
					"name": "Projects",
					"hover": "click to show all of your projects and projects you're connected to",
					"description": "These are the recent projects taking place in the community",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-projects'],
					filterItem: function(item) {
						return (item.getType() === "ProjectHub.project" && item.clientOwns()) || (item.getType() === "ProjectHub.connection" && item.clientOwns() && item.getConnectionTo().getType() == "ProjectHub.project");
					},
					urlComponent: function(stub, segments) {
						return 'Projects/Yours'
					}
				}), loginGuest({
					"html": "Your Connections",
					"class": "menu-main-connections hidden",
					"name": "Connections",
					"description": "These are your connections",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-connections'],
					filterItem: function(item) {
						return item.getType() === "ProjectHub.connection" && item.clientOwns();
					},
					urlComponent: function(stub, segments) {
						return 'Connections/Yours'
					}
				}), loginGuest({
					"html": "Your Community",
					"name": "Profiles",
					"hover": "click to show all of the people your connected to",
					"description": "These are your connections to community members",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-profiles'],
					filterItem: function(item) {
						return item.getType() === "ProjectHub.connection" && item.clientOwns() && item.getConnectionTo().getType() == "ProjectHub.profile";
					},
					map: function(item) {
						return item.getConnectionTo();
					},
					urlComponent: function(stub, segments) {
						return 'Profiles/Yours'
					}
				}), {
					"html": "All Resources",
					"name": "Resources",
					"class": "menu-main-events hidden",
					"description": "These are the available resources",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-resources'],
					filterItem: function(item) {
						return item.getType() === "ProjectHub.resource";
					}
				}, {
					"html": "All Events",
					"name": "Events",
					"class": "menu-main-events hidden",
					"description": "These are the events taking place soon or took place recently",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-events'],
					filterItem: function(item) {
						return item.getType() === "ProjectHub.event";
					}
				}, {
					"html": "All Projects",
					"name": "Projects",
					"class": "menu-main-projects hidden",
					"description": "These are the recent projects taking place in the community",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-projects'],
					filterItem: function(item) {
						return item.getType() === "ProjectHub.project";
					}
				}, {
					"html": "Connections",
					"class": "menu-main-connections hidden",
					"name": "Connections",
					"description": "These are connections between members",
					"namedView": "bottomDetail",
					"labelContent": labelContent['label-for-connections'],
					filterItem: function(item) {
						return item.getType() === "ProjectHub.connection";
					}
				}, {
					"html": "Community",
					"class": "menu-main-profiles hidden",
					"name": "Profiles",
					"description": "These are other community members",
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
					"description": function() {

						var btns = new Element('span', {
							"html": "filtering items matching tag"+(me.countTags()==1?"":"s")+": "
						});

						me.createTagBtnsClearCurrent(btns)

						return btns;



					},
					filterItem: function(item) {
						return EventList.SharedInstance().itemMatchesFilter(item, me.getApplication().getNamedValue('tagFilter'));
					},
					urlComponent: function(stub, segments) {

						if (segments && segments.length) {
							me.getApplication().setNamedValue('tagFilter', {
								"tags": [segments[0]]
							});
						}

						var filter = me.getApplication().getNamedValue('tagFilter');
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
						return EventList.SharedInstance().itemMatchesFilter(item, me.getApplication().getNamedValue('dateFilter'));
					},
					urlComponent: function(stub, segments) {

						if (segments && segments.length) {
							me.getApplication().setNamedValue('dateFilter', {
								"dates": [segments[0]]
							});
						}

						var filter = me.getApplication().getNamedValue('dateFilter');
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
					"description": function() {

						var item = CuhubDashboard.getActiveItem();
						if (!item) {

							return "loading";
						}

						var label = "This is the " + item.getTypeName() + " page for <span>'" + item.getName() + "'</span>";

						if (item.hasOwner()&&item.showsOwner()) {
							try {
								var owner = item.getOwnersProfile();
								var userEl = CuhubDashboard.createAuthorLabel(owner);

								var labelEl = new Element('span', {
									"html": label
								});
								labelEl.appendChild(userEl);
								return labelEl;

							} catch (e) {
								console.error(e);
							}


						}

						return label;


					},
					"class": "menu-main-single hidden",
					urlComponent: function(stub, segments) {
						if (segments && segments.length) {

							EventList.SharedInstance(function(el) {

								if (segments[0] === "me") {
									segments[0] = "profile-" + el.getClientProfile().getId();
								}

								var item = segments[0].split('-');

								if (el.hasItem(item[1], item[0])) {

									EventList.SharedInstance().getItem(item[1], item[0]).activate();
									me.setPageDescription();
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
				return button.namedView || (section.toLowerCase() + (button.name || button.html) + "Detail");
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + (button.name || button.html).toLowerCase())
			},
			sectionClass: function(section) {
				return "menu-" + section.toLowerCase() + ' primary-navigation'
			},
			formatEl: function(li, button) {
				if (button && button.labelContent) {
					li.appendChild(new Element('label', {
						html: button.labelContent
					}));
				}


				if (button && button.hover) {

					new UIPopover(li, {
						title: button.hover,
						anchor: UIPopover.AnchorAuto()
					});

				}

			}
		})).addEvent('navigationStart', function(button) {

			me.getApplication().setNamedValue('feedItemFilter', function(item) {
				return button.filterItem ? button.filterItem(item) : true;
			});

			me.getApplication().setNamedValue('feedItemMap', function(item) {
				return button.map ? button.map(item) : item;
			});

		});

		me.getApplication().setNamedValue('navigationController', navigationController);

		return [me.createCreationNavigationController(), navigationController];



	},



	createTopNavigationController: function() {

		var me = this;


		var navigationController = new NavigationMenuModule({
			"header-menu": [{
				"html": "Resources",
				"name": "Resources",
				"hover": "browse available resources",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("Resources", "Main");
					}
				},
				tagName: 'span'
			}, {
				"html": "All Events",
				"name": "Events",
				"hover": "browse all events for all projects and members",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("Events", "Main");
					}
				},
				tagName: 'span'
			}, {
				html: "All Projects",
				name: "Projects",
				"hover": "browse all project from all members",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("Projects", "Main");
					}
				},
				tagName: 'span'
			}, {
				html: "All Profiles",
				name: "Profiles",
				"hover": "browse all members",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("Profiles", "Main");
					}
				},
				tagName: 'span'
			}, {
				html: "Help",
				name: "Help",
				"hover": "Take a tour of the site",
				"events": {
					"click": function() {


						var elements = me._hiddenTutorialElementSelectors()


						new UITutorial().addEvent('start', function() {


							me.lightBlurElementSelectors(elements);
							
							var main = me.getRootElement();
							main.setStyles({
								"overflow": "hidden"
							});
							main.scrollTo(0, 0);


						}).addEvent('end', function() {

							me.unBlurElementSelectors(elements);

							$$('.ui-view.root-container')[0].setStyles({
								"overflow": null
							});

						}).addEvent('show', function(el) {

							el.setStyles({
								filter: null,
								//"pointer-events":null,
								"opacity": null
							});


						}).addEvent('hide', function(el) {

							el.setStyles({
								filter: "grayscale(90%) blur(0.5px)",
								"pointer-events": "none",
								"opacity": 0.7
							});


						}).addTutorialStep(
							'.template-content>.intro-text',
							'This area contains a short description of the current page and the content that is displayed', {}).addTutorialStep(
							'.field-value-module.section-item-icon.pinned-label',
							'This is your pins link and takes you to the page containing all the items you have pinned.', {}).addTutorialStep(
							'.field-value-module.section-item-icon.calendar-label',
							'This is the calender link it displays a calendar of all your recent activity', {}).addTutorialStep(
							'.ui-view.tag-cloud-filter',
							'These are quick filters to help you find projects and events', {}).addTutorialStep(
							'.primary-navigation',
							'These buttons link to all the people you are following and all the projects and events that you have created or engaged with', {}).addTutorialStep(
							'.create-buttons>li',
							'You can create your own projects and events', {}).start();
					}
				},
				tagName: 'span'
			}]

		}, {
			manipulateHistory: false,
			formatEl: function(li, button) {

				if (button && button.hover) {

					new UIPopover(li, {
						title: button.hover,
						anchor: UIPopover.AnchorTo(['bottom']),
						className: 'popover tip-wrap hoverable onblack'
					});

				}

			}
		});

		return navigationController;

	},

	_hiddenTutorialElementSelectors:function(){
		return [
			'.site-logo',
			'.header-menu',
			'.ui-view.user-detail.top-right',
			'.template-content>.intro-text',

			'.primary-navigation',
			'.create-buttons>li',

			'.field-value-module.section-item-icon.pinned-label',
			'.field-value-module.section-item-icon.calendar-label',
			'.ui-view.tag-cloud-filter',

			'.ui-view.main-content-detail'

		];
	},

	createCreationNavigationController: function() {


		var me = this;

		var createMenuItems = [{
			"html": "Create",
			"name": "Create",
			"class": "menu-main-feeditems create-new",
			"namedView": "bottomDetail",
			"labelContent": "Create",
			"hover": "click to create new projects and events",
			events: {
				click: function() {


					if (AppClient.getUserType() == "guest") {
						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							"loginForm",
							AppClient, {
								"template": "form"
							}
						);
						return;
					}


					var item = EventList.SharedInstance().getClientProfile();
					if (!item.isPublished()) {

						var formName = item.getType().split('.').pop() + "Form";

						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							formName,
							item, {
								"template": "form",
								"className": item.getType().split('.').pop() + "-form"
							}
						);

						return;
					}

					var formName = "createItemsMenuForm";

					var wizard = me.getApplication().getDisplayController().displayPopoverForm(
						formName,
						item, {
							"template": "form"
						}
					);


				}
			}
		}];


		if (AppClient.getUserType() == "admin") {

			createMenuItems.push({
				"html": "Resource",
				"name": "Resource",
				"class": "menu-main-feeditems create-resource",
				"namedView": "bottomDetail",
				"labelContent": "Add Resource",
				"hover": "click to create a new resource",
				events: {
					click: function() {


						var formName = "resourceForm";

						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							formName,
							(new ResourceItem({
								item: EventList.SharedInstance().getClientProfile()
							})), {
								"template": "form",
								"className": "resource-form"
							}
						);


					}
				}
			});

		}


		var navigationController = new NavigationMenuModule({
			"Main": createMenuItems

		}, {
			manipulateHistory: false,
			sectionClass: function(section) {
				return "menu-" + section.toLowerCase() + ' no-vert-pad create-buttons'
			},
			buttonClass: function(button, section) {
				return button["class"] || ("menu-" + section.toLowerCase() + "-" + (button.name || button.html).toLowerCase())
			},
			formatEl: function(li, button) {

				if (button && button.labelContent) {
					li.appendChild(new Element('label', {
						html: button.labelContent
					}));
				}

				if (button && button.hover) {

					new UIPopover(li, {
						title: button.hover,
						anchor: UIPopover.AnchorTo(['bottom']),
						className: 'popover tip-wrap hoverable'
					});

				}

			}
		});

		return navigationController;

	},



	createBottomNavigationController: function() {


		var me = this;

		var navigationController = new NavigationMenuModule({
			"Site": [{
				"html": "Portal",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("FeedItems", "Main");
					}
				}
			}, {
				html: "About",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("About", "Main");
					}
				}
			}, {
				html: "Contact",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("Contact", "Main");
					}
				}
			}, {
				html: "Archive",
				"events": {
					"click": function() {
						me.getNavigationController().navigateTo("Archive", "Main");
					}
				}
			}]

		}, {
			manipulateHistory: false,
			formatEl: function(li, button) {

				if (button && button.hover) {

					new UIPopover(li, {
						title: button.hover,
						anchor: UIPopover.AnchorAuto()
					});

				}

			}
		});

		//application.setNamedValue('navigationController', navigationController);
		return navigationController;

	},


	getPageLabel:function() {

		var me=this;

		var menu = CuhubDashboard.getNavigationController();
		if (menu) {
			var view = menu.getCurrentView().view;
			if ((['Events', 'Projects', 'Connections', 'Profiles']).indexOf(view) >= 0) {
				return "Project Hub Portal " + view;
			}
			if (view == 'Tags') {
				var tags = me.getApplication().getNamedValue('tagFilter').tags;
				return "Project Hub Portal Items With Tag" + (tags.length > 1 ? "s" : "") + ": " + tags.join(", ");
			}
			return view;
		}

		return "Project Hub Portal Items";


	},


	setPageDescription:function(state) {


		var me=this;
		if(!state){
			me.getNavigationController(function(nav){
				me.setPageDescription(nav.getCurrentView())
			});
			return;
		}
		
		var el=me._pageDescriptionEl;
		
		el.innerHTML = "loading";
		var content = me._pageDescriptionForState(state, function(callbackContent){

			if (typeof callbackContent == "string") {
				el.innerHTML = callbackContent;
				return;
			}

			if (callbackContent) {
				el.innerHTML = "";
				el.appendChild(callbackContent);
			}


		});
		if (typeof content == "string") {
			el.innerHTML = content;
			return;
		}

		if (content) {
			el.innerHTML = "";
			el.appendChild(content);
		}

	},
	_pageDescriptionForState:function(state, cb) {

		var me=this;

		var button =me.getNavigationController().getButton(state);
		if (button.description) {
			if (typeof button.description == 'function') {
				return button.description(cb);
			}
			return button.description;
		}
		return JSON.stringify(state);

	},

	getPageDescriptionModule() {

		var me=this;

		var mod = new ElementModule("div", {
			"class": "intro-text"
		})
		var p = new Element('p', {
			html: "Welcome to CUHub ... and description of current page"
		});

		me._pageDescriptionEl=p;

		mod.appendChild(p)

		me.getNavigationController(function(nav) {
			nav.addEvent('navigate', function(state) {
				me.getRootElement().scrollTo(0, 0);
				me.hideSearch();
				me.showPageDescription();
				me.setPageDescription();
			});
			me.setPageDescription();
		});

		me._pageDescriptionModule=mod;

		return mod;

	},

	hidePageDescription:function(){
		var me=this;
		me._pageDescriptionModule.getElement().addClass('hidden');
	},

	showPageDescription:function(){
		var me=this;
		me._pageDescriptionModule.getElement().removeClass('hidden');
	},
	hideSearch:function(){
		var me=this;
		me._search.getElement().removeClass('active');
		me.unBlurElementSelectors(me._hiddenSearchElementSelectors())
		if(me._keyup){
			document.removeEvent('keyup', me._keyup);
			delete me._keyup;
		}

	},
	heavyBlurElementSelectors:function(elements){
		(elements).forEach(function(selector) {

			$$(selector).forEach(function(el) {
				el.setStyles({
					filter: "grayscale(90%) blur(0.7px)",
					"pointer-events": "none",
					"opacity": 0.4
				});
			});
		})
	},
	lightBlurElementSelectors:function(elements){
		(elements).forEach(function(selector) {

			$$(selector).forEach(function(el) {
				el.setStyles({
					filter: "grayscale(90%) blur(0.5px)",
					"pointer-events": "none",
					"opacity": 0.7
				});
			});
		})
	},
	unBlurElementSelectors:function(elements){
		(elements).forEach(function(selector) {

			$$(selector).forEach(function(el) {
				el.setStyles({
					filter: null,
					"pointer-events": null,
					"opacity": null
				});
			});
		})
	},
	_hiddenSearchElementSelectors:function(){
		return [
			'.site-logo',
			'.header-menu',
			'.ui-view.user-detail.top-right',
			//'.template-content>.intro-text',

			'.primary-navigation',
			'.create-buttons>li',

			'.field-value-module.section-item-icon.pinned-label',
			'.field-value-module.section-item-icon.calendar-label',
			'.ui-view.tag-cloud-filter',

			'.ui-view.main-content-detail'
		];
	},

	showSearch:function(){
		var me=this;
		me._search.getElement().addClass('active');
		me.heavyBlurElementSelectors(me._hiddenSearchElementSelectors());
		me._keyup=function(k){

			if(k.key=='esc'){
				me.hideSearch();
			}
		}
		document.addEvent('keyup', me._keyup);

	},

	getSearchAggregators: function(search) {

		var me = this;

		me._search=search;

		search.addButton('Search', function() {


			var el = search.getElement();
			if (el.hasClass('active')) {
				me.showPageDescription();
				me.hideSearch();
				return;
			}
			me.hidePageDescription();
			me.showSearch();

		}, {
			text: false, //ignored if button is set, if this is false and button is also false the name argument is used
			button: false, //an image url to append using html image element
			buttonClassName: "search-bar-btn search-toggle",
		});


		var FeeditemSearch = new Class({
			Extends: UISearchListAggregator,
			initialize: function(search, options) {
				//var me = this;
				this.parent(search, Object.append({

					PreviousTemplate: UIListAggregator.PreviousTemplate,
					MoreTemplate: UIListAggregator.MoreTemplate,
					ResultTemplate: UIListAggregator.NamedViewTemplate(CuhubDashboard.getApplication(), {
						namedView: "eventFeedSearchItemDetail",
						events: {
							click: function() {

								CuhubDashboard.getNavigationController().navigateTo("Single", "Main");
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


		return [new FeeditemSearch(search, {})];

	},


	createNewFeedItemNavigationInWizard:function(parentWizard) {

		var me=this;

		var navigationController = new NavigationMenuModule({
			"Main": [{
				"html": "Create Event",
				"name": "Create",
				"class": "menu-main-feeditems create-new new-event",
				"namedView": "bottomDetail",
				"labelContent": "Create a new calendar event",
				events: {
					click: function(e) {

						e.stop();
						parentWizard.close();

						var item = EventList.SharedInstance().getClientProfile();
						var formName = "eventForm";

						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							formName,
							new EventItem({
								"item": item,
							}).addEvent("save", function() {
								var item = this;
								EventList.SharedInstance(function(el) {

									el.addItem(item);

								});
							}), {
								"template": "form",
								"className": "event-form"
							}
						);

					}
				}
			}, {
				"html": "Create Project",
				"name": "Create",
				"class": "menu-main-feeditems create-new new-project",
				"namedView": "bottomDetail",
				"labelContent": "Create a new community/research project",
				events: {
					click: function(e) {

						e.stop();
						parentWizard.close();

						var item = EventList.SharedInstance().getClientProfile();
						var formName = "projectForm";

						var wizard = me.getApplication().getDisplayController().displayPopoverForm(
							formName,
							new ProjectItem({
								"item": item,
							}).addEvent("save", function() {
								var item = this;
								EventList.SharedInstance(function(el) {

									el.addItem(item);

								});
							}), {
								"template": "form",
								"className": "project-form"
							}
						);

					}
				}
			}]

		}, {

			manipulateHistory: false,
			formatEl: function(li, button) {
				if (button && button.labelContent) {
					li.appendChild(new Element('label', {
						html: button.labelContent
					}));
				}
			}
		});

		//application.setNamedValue('navigationController', navigationController);
		return navigationController;

	},



	createFooterDetailMenus:function(){

		var me=this;
		return [
		    me.createBottomNavigationController(),
		    me.createBottomNavigationController(),
		  	me.createBottomNavigationController()
		];
	},



	formatStickyTabLabel:function(el, view) {


		var me=this;

		el.addClass("section-item-icon");
		el.addClass(view.toLowerCase() + '-label');
		el.addEvent('click', function(e) {

			if (view == "Pinned") {
				if (AppClient.getUserType() == "guest") {

					e.stop();
					var wizard = me.getApplication().getDisplayController().displayPopoverForm(
						"loginForm",
						AppClient, {
							"template": "form"
						}
					);
					return;

				}

			}

			me.getApplication().getNamedValue('navigationController').navigateTo(view, "Main");
		});


		if (view == "Pinned") {


			EventList.SharedInstance(function(elist) {
				el.setAttribute('data-count-pins', elist.getPinnedEvents().length);
			});

			new UIPopover(el, {
				title: "click this to view all the items you've pinned",
				anchor: UIPopover.AnchorAuto()
			});

			new WeakEvent(el, EventList.SharedInstance(), 'pinnedItem', function(feedItem) {
				var item = el.appendChild(new Element('div', {
					"class": "added-pin"
				}));

				item.setAttribute('data-label', "Pinned " + feedItem.getName());
				el.setAttribute('data-count-pins', EventList.SharedInstance().getPinnedEvents().length);
				setTimeout(function() {
					item.setStyles({
						"top": -100,
						"opacity": 0
					})
				}, 50);

				setTimeout(function() {
					el.removeChild(item);
				}, 2000);
			});

			new WeakEvent(el, EventList.SharedInstance(), 'unpinnedItem', function(feedItem) {
				var item = el.appendChild(new Element('div', {
					"class": "removed-pin"
				}));

				item.setAttribute('data-label', "Unpinned " + feedItem.getName());
				el.setAttribute('data-count-pins', EventList.SharedInstance().getPinnedEvents().length);

				setTimeout(function() {
					item.setStyles({
						"top": -100,
						"opacity": 0
					})
				}, 50);
				setTimeout(function() {
					el.removeChild(item);
				}, 2000);
			});



		}

		if (view == "Calendar") {
			new UIPopover(el, {
				title: "click this to view items in a calender",
				anchor: UIPopover.AnchorAuto(),
				margin: 20
			});
		}


	},



	getActiveItemDetailItemList:function(callback){

		// var events=EventList.SharedInstance().getEvents();

		 EventList.SharedInstance(function(el){
		        
		        var items=el.getActiveItems();
		        if(items.length){
		            var item=items[0];
		            if(item.showsOwner()){
		                items=el.getParentItems(item).concat(items);
		            }
		            items=items.concat(el.getChildItems(item));
		        }
		        
		        callback(items);
		    
		 })


	},


	addFeedItemStyle:function(element, item) {

		if(element instanceof Module){
			element=element.getElement();
		}

		element.addClass((item.getType().split('.').pop()) + '-feed-item');
		element.addClass('feed-item-' + item.getId());

		if (item instanceof ConnectionItem) {
			try{
				element.addClass((item.getConnectionTo().getType().split('.').pop()) + '-feed-item');
			}catch(e){
				element.addClass('missing-feed-item');
			}
		}


	},
	addFeedItemEvents:function(module, item){

		var me=this;

		var nav=me.getNavigationController();

		module.getElement().addEvent('click', function(e){
		    
		    var clickItem=item;
		    if(item instanceof ConnectionItem){
		    	try{
		        	clickItem=item.getConnectionTo();
		    	}catch(e){
		    		console.error(e);
		    		return;
		    	}
		    }
		    
		    if(clickItem.isActive()&&nav.getCurrentView().view=="Single"){
		        return;
		    }
		    
		    clickItem.activate();
		    nav.navigateTo("Single", "Main");
		   
		});

		if((item.isActive()&&nav.getCurrentView().view=="Single")||item instanceof MyProfileItem){
		     module.draw();
		}

		module.addWeakEvent(item, 'deactivate', function(){
		    module.empty();
		});

		module.addWeakEvent(item, 'activate', function(){
		     //module.draw();
		});

	}



});



var CuhubDashboard = new DashboardController();