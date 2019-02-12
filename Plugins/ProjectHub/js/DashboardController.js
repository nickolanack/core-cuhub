var DashboardController = new Class({


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

	setLabels:function(labels){
		var me=this;
		me._labels = labels;
	},

	getLabel:function(key) {
		var me=this;
			if (me._labels && me._labels[key]) {
				return me._labels[key];
			}
			return key;
	},

	getLabels:function(){
		var me=this;
		return me._labels;
	},

	getFeedItemBottomButtons: function(item) {

		var me = this;

		return [
			me.createDirectChatButton(item),
			me.createConnectionButton(item)
		];

	},

	createConnectionButton: function(item) {


		var me = this;

		var defaultLabel = "Connect to this {type}";
		var fn = function() {

			if (item instanceof ConnectionItem) {
				item = item.getConnectionTo();
			}

			if (!item.canCreateConnectionFrom(EventList.SharedInstance().getClientProfile())) {
				return null;
			}

			var hasConnection = item.hasConnectionFrom(EventList.SharedInstance().getClientProfile());


			var form = 'connectionForm';
			var className = "action-connection";
			var name = "Connected with " + item.getTypeName();
			var hover = "click to create a new connection with " + item.getName();

			var quickConnect = false;




			var label = defaultLabel.replace('{type}', item.getTypeName());
			var disconnectConfirm="Are you sure you want to remove this connection"

			var ifConnection=function(a, b){
				return hasConnection?a:b;
			}

			if (item instanceof ProfileItem) {

				label = ifConnection("You Are Following ","Follow ") + item.getName();
				form = 'connectWithUserForm';
				className = "action-profile";
				quickConnect = true;
				hover = "click to "+ifConnection("stop following ", "follow ") + item.getName();
				disconnectConfirm="Are you sure you want to stop following "+ item.getName();

			}



			if (item instanceof ProjectItem) {
				label = ifConnection("You Are Following ","Follow ") + item.getName();
				className = "action-project";
				name = "Following " + item.getTypeName();
				hover = "click to "+ifConnection("stop following ", "follow ") + item.getName();
				quickConnect = true;
				disconnectConfirm="Are you sure you want to stop following "+ item.getName();
			}



			if (item.getType() == "ProjectHub.event") {
				label = ifConnection("You are Volunteering ","Volunteer ");
				className = "action-event";
				form = 'connectWithEventForm';
				name = "Volunteering for " + item.getTypeName();
				hover = "click to "+ifConnection("stop volunteering ","volunteer ")+" for " + item.getName();
				disconnectConfirm="Are you sure you want to stop volunteering for"+ item.getName();

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
								if(userAccepted){

									var connection=item.getConnectionFrom(EventList.SharedInstance().getClientProfile());
									connection.destroy(function(){
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

		var me=this;

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

	createConnectionToOwnerProfileButton:function(item) {

		var me=this;

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



	createMapTileUrl:function(item) {

		if (item.getType() != "ProjectHub.event") {
			return null;
		}

		


		var staticMap = new ElementModule('div', {
			"class": "static-map"
		});

		

		var setLocationData=function(){

			staticMap.getElement().innerHTML='';
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
				"class":"map-location",
				"href":'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(item.config.attributes.location),
				"html":item.config.attributes.location,
				"target":"_blank"
			}))
		};

		var setTimeData=function(){
			staticMap.getElement().addClass('no-time');

			if(item.hasEventDate()){
				staticMap.getElement().removeClass('no-time');
				staticMap.getElement().appendChild(new Element('p', {
					"class":"event-time",
					"html":item.getEventDateFormatted()
				}));
			}

			

		}

		staticMap.addWeakEvent(item, 'save', function(){
			setLocationData();
			setTimeData();
		});
		setLocationData();
		setTimeData();
		
		return staticMap;

	},

	appendFeedItemActions:function(el, item){

		var me=this;

		el.addClass('feed-item-actions')

		me.createActionButtons(item).forEach(function(b){
		    el.appendChild(b);
		});


	},

	createActionButtons:function(item) {


		var me=this;

		

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
											item.destroy();
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

								me.getApplication().getNamedValue('navigationController').navigateTo("FeedItems", "Main");

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



	createFeedItemSubChildButtons:function(item) {


		var me=this;

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

		var me=this;

		el.addClass('feed-item-label');


		if (item instanceof ConnectionItem) {

			if (item.isConnected()) {
				var connectedTo = item.getConnectionTo();
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
				var nav = me.getApplication().getNamedValue('navigationController');
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



		if (item.hasOwner()) {
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

	getItemLabelValue:function(item){
		if(item instanceof MyProfileItem&&AppClient.getUserType()=="guest"){
		    return "You are not logged in"
		}

		var str= (item.getName?item.getName():"{name}");

		return str;
	},

	formatDefaultPost:function(item, el, valueEl){

		var me=this;

		el.addClass('post-author')

			var id=item.getUserId();
			el.addClass('user-id-'+id);
			if(id<=0){
			    return;
			}
			var user=EventList.SharedInstance().getProfileForUserId(id);
			if(user){
			    valueEl.appendChild(me.createAuthorLabel(user, me.getApplication()));
			}


	},


	formatPrivateDiscussion:function(el, valueEl, item){

		var me=this;

		el.addClass('post-author private-chat feed-item-label')

		var id=item.getId();
		el.addClass('user-id-'+id);
		if(id<=0){
		    return;
		}
		var user=item;
		if(user){
		    valueEl.appendChild(CuhubDashboard.createAuthorLabel(user))
		}

		el.parentNode.addEvent("click",function(){


			me.getApplication().getDisplayController().displayPopoverForm(
				"directChatForm", 
				user, 
				{
					"template": "form",
					"className": "contact-form"
				}
			);


		});


	},

	createAuthorLabel:function(owner) {

		var me=this;

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
			var nav = me.getApplication().getNamedValue('navigationController');
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



	formatDiscussionCounters:function(el, valueEl, item) {


		var me=this;

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

			if (AppClient.getUserType()!=="guest"&&newPosts > 0) {
				el.addClass('has-new-posts');
			}


			if (resp.subscription) {
				AjaxControlQuery.Subscribe(resp.subscription, function(result) {

					//console.log(item);
					//console.log(result);

					posts++;

					if(AppClient.getId()!=result.user){
						newPosts++;
					}

					

					if (AppClient.getUserType()!=="guest"&&newPosts == 1) {
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


	_getDiscussionChannel:function(item, defaultChannel){


		if(item instanceof ProfileItem){
		    var ids=([item.getId(), EventList.SharedInstance().getClientProfile().getId()]).sort();
		    return "direct-"+ids.join("-");
		}


		return defaultChannel;
	},



	createItemIcon:function(item) {

		var me=this;

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
				var nav = me.getApplication().getNamedValue('navigationController');
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


	appendTagFilterButtons:function(el, item) {

		var me=this

		el.addClass('feed-item-tags')
		me.createTagFilterButtons(item).forEach(function(t){
		    el.appendChild(t);
		})
	},

	createTagFilterButtons:function(item) {

		var me=this;	

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

						me.getApplication().setNamedValue('tagFilter', {
							"tags": [tag]
						});
						me.getApplication().getNamedValue('navigationController').navigateTo("Tags", "Main");

						e.stop();

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



	setActiveItem:function(item) {

		var me=this

		if (me._activeItem && item !== me._activeItem) {
			me.clearActiveItem();
		}
		CuhubDashboard.getApplication().getNamedValue('navigationController').addUrlSegment(item.getType().split('.').pop() + '-' + item.getId());
		me._activeItem = item;
	},
	clearActiveItem:function() {

		var me=this
		if (me._activeItem) {
			if (me._activeItem.isActive()) {

				CuhubDashboard.getApplication().getNamedValue('navigationController').removeUrlSegment(me._activeItem.getType().split('.').pop() + '-' + me._activeItem.getId());

				me._activeItem.deactivate();
			}
			me._activeItem = null;
		}
	},

	getActiveItem:function() {

		var me=this
		if (me._activeItem) {
			return me._activeItem;
		}
		return null;
	},



	defaultItemTags:function(item) {

		var me=this;

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


	createTagBtn:function(tag, options) {

		return new Element('button', Object.append({
			"class": "btn-tag tag-" + tag,
			"html": tag,
			"title": tag
		}, options));
	},

	

	createNavigationController:function() {
		

		var me=this;

		labelContent=me.getLabels();

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
						return item.getType() !== "ProjectHub.connection";
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
							"html": "filtering items matching tag: "
						});
						me.getApplication().getNamedValue('tagFilter').tags.forEach(function(tag) {
							btns.appendChild(CuhubDashboard.createTagBtn(tag, {
								events: {
									click: function(e) {


										e.stop();
										var tags = me.getApplication().getNamedValue('tagFilter').tags;
										var i = tags.indexOf(tag);
										if (i >= 0) {
											tags.splice(i, 1);
											me.getApplication().setNamedValue('tagFilter', {
												"tags": tags
											});
										}
										if (tags.length) {
											me.getApplication().getNamedValue('navigationController').navigateTo("Tags", "Main");
											return;
										}

										me.getApplication().getNamedValue('navigationController').navigateTo("FeedItems", "Main");



									}
								}
							}));
						})

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

							return "loading error";
						}

						var label = "This is the " + item.getTypeName() + " page for <span>'" + item.getName() + "'</span>";

						if (item.hasOwner()) {
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

		EventList._navigationController = navigationController;
		return [EventList.CreateCreationNavigation(me.getApplication()), navigationController];



	}




});



var CuhubDashboard = new DashboardController();