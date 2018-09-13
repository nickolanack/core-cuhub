




var EventItem=new Class({

	Extends:DataTypeObject,
	Implements:[Events],

	initialize:function(config){
		var me=this;
		me.config=me._defaults(config);
		if(me.config.id){
			me._id=me.config.id;
		}
	},
	_defaults:function(config){
		var me=this;
		return Object.append({
			"name":"My New "+me.getType().split('.').pop().capitalize(),
			"description":""
		}, config);
	},
	isActive:function(){
		return !!this._active;
	},
	deactivate:function(){
		var me=this;
		if(me._active){
			me._active=false;
			me.fireEvent('deactivate');

			
		}
		return me;
	},
	getChildItems:function(){
		var me=this;
		return EventList.SharedInstance().getAllEvents().filter(function(e){
			return(e.hasOwner()&&e.getOwner().isEqualTo(me));
		})
	},
	activate:function(){
		var me=this;
		if(!me._active){
			me._active=true;
			me.fireEvent('activate');
			EventItem.SetActiveItem(me);
		}
		return me;

	},
	toggleActive:function(){
		var me=this;

		if(me.isActive()){
			return me.deactivate();
		}

		return me.activate();

	},
	hasDate:function(){
		return !isNaN((new Date(this.config.publishedDate||this.config.createdDate)).valueOf())
	},
	getDateStr:function(){
		var p=(new Date((new Date(this.config.publishedDate||this.config.createdDate)).valueOf()+CoreServerDateOffset)).toLocaleDateString().split('/');
		var pad=function(d){
			if((d+"").length==1){
				return "0"+d;
			}
			return d;
		}
		return ([p[2], pad(p[0]), pad(p[1])]).join('-');
	},

	hasEventDate:function(){
		var me=this;
		if(me.config.attributes&&me.config.attributes.eventDate&&me.config.attributes.eventDate!==""){
			return true;
		}
		return false;
	},

	getEventDay:function(){

		return parseInt(this.getEventDateStr().split('-').pop());
		
	},

	getEventDateStr:function(){
		var me=this;

		if(me.hasEventDate()){

			return me.config.attributes.eventDate;

		}

		throw 'Does not have event date';
	},

	getEventDateFromNow:function(){
		
		var me=this;

		if(me.hasEventDate()){

			var timeStr=me.config.attributes.eventTime&&me.config.attributes.eventTime!==""?me.config.attributes.eventTime:"00:00:00";
			return moment((new Date(me.config.attributes.eventDate+" "+timeStr)).valueOf()+CoreServerDateOffset).fromNow();

		}

		throw 'Does not have event date';

		
	},


	getMillisecondDateTime:function(){
		return (new Date(this.config.publishedDate||this.config.createdDate)).valueOf()+CoreServerDateOffset;
	},
	getDateFromNow:function(){
		return moment((new Date(this.config.publishedDate||this.config.createdDate)).valueOf()+CoreServerDateOffset).fromNow();
	},
	getDescription:function(){
		return this.config.description;
	},
	setDescription:function(description){
		this.config.description=description;
		return this;
	},
	getName:function(){
		return this.config.name;
	},
	setTitle:function(name){
		return this.setName(name);
	},
	setName:function(name){
		this.config.name=name;
		return this;
	},

	getType:function(){
		return 'ProjectHub.event';
	},
	getTypeName:function(){
		return this.getType().split('.').pop().capitalize();
	},
	// hasIcon:function(){
	// 	return false;
	// },
	// getIcon:function(){
	// 	throw 'Does not have icon';
	// },

	hasIcon:function(){
		if(this.config.attributes&&this.config.attributes.eventIcon){
			var images = JSTextUtilities.ParseImages(this.config.attributes.eventIcon);
			return images.length>0;
		}
		return false;
	},
	getIcon:function(){
		if(this.config.attributes&&this.config.attributes.eventIcon){
			var images = JSTextUtilities.ParseImages(this.config.attributes.eventIcon);
			return images[0].url
		}
		return false;
	},

	canCreate:function(name){
		return false;
	},

	canCreateConnectionFrom:function(itemA){

		if(this.isEqualTo(itemA)){
			return false
		}

		var ownerA=itemA;
		if(!(itemA instanceof ProfileItem)){
			ownerA=itemA.getOwnersProfile();
		}

		var ownerThis=this;
		if(!(ownerThis instanceof ProfileItem)){
			ownerThis=ownerThis.getOwnersProfile();
		}

		if(ownerThis.isEqualTo(ownerA)){
			return false;
		}


		return true;
	},


	isEqualTo:function(id, type){

		if(id instanceof EventItem){
			type=id.getType();
			id=id.getId();
		}

		var me=this;
		if(me.getId()+""===id+""&&(me.getType()===type||me.getType()==="ProjectHub."+type)){
			return true;
		}
		return false;

	},

	pin:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'pin_item', {

			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			me.config.pinned=true;
			me.fireEvent('pin');
			
		}).execute();


	},
	unpin:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'unpin_item', {
			
			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			me.config.pinned=false;
			me.fireEvent('unpin');
			
		}).execute();


	},
	archive:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'archive_item', {

			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			me.config.archived=true;
			me.fireEvent('archive');

		}).execute();


	},
	unarchive:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'unarchive_item', {
			
			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			me.config.archived=false;
			me.fireEvent('unarchive');
			
		}).execute();


	},
	getActions:function(){
		var actions=[
			this.isPinned()?'unpin':'pin', 
			this.isArchived()?'unarchive':'archive', 
			'focus'
		];
		 
		if(this.clientCanEdit()){
			actions.push('edit');
			if(this.getType()==="ProjectHub.profile"){
				actions.push('delete-disabled');
			}else{
				actions.push('delete');
			}
		}
		return actions;
	},
	clientCanEdit:function(){

		if(AppClient.getUserType()=="admin"){
			return true;
		}

		return this.clientOwns();
		
	},
	hasOwner:function(){
		var me=this;
		if(me instanceof ProfileItem){
			return false;
		}
		if(me.config.itemId&&me.config.itemType){
			return true;
		}
		return false;


	},
	getOwner:function(){
		var me=this;

		if(me.config.itemId&&me.config.itemType){
			if(EventList.SharedInstance().hasItem(me.config.itemId,me.config.itemType)){
				var ownerItem= EventList.SharedInstance().getItem(me.config.itemId,me.config.itemType);
				return ownerItem;
				
			}
			throw 'Owner item is set but is not available..! ';
		}
		throw 'No Owner!';
	},
	getOwners:function(){
		var me=this;
		if(!me.hasOwner()){
			return [];
		}

		var list=[me.getOwner()];
		if(list[0].hasOwner()){
			list=list[0].getOwners().concat(list);
		}
		return list;



	},
	getOwnersProfile:function(){
		var me=this;
		if(me.config.itemId&&me.config.itemType){
			if(EventList.SharedInstance().hasItem(me.config.itemId,me.config.itemType)){
				var ownerItem= EventList.SharedInstance().getItem(me.config.itemId,me.config.itemType);
				if(ownerItem instanceof ProfileItem){
					return ownerItem;
				}
				return ownerItem.getOwnersProfile();
			}
			throw 'Owner item is set but is not available..! ';
		}
		throw 'No Owner!';

	},
	clientOwns:function(){
		var userid=AppClient.getId();

		var parentItem=this._getParentItemIdType();

		if(userid===parentItem.itemId&&parentItem.itemType==="user"){
			return true;
		}





		return false;
	},

	getTags:function(){
		var me=this;
		if(me.config&&me.config.attributes&&me.config.attributes.tags){
			if(Object.prototype.toString.call(me.config.attributes.tags) === '[object Array]'){
				return me.config.attributes.tags.slice(0);
			};
		}
		return [];
	},
	isPinned:function(){
		var me=this;
		return !!(me.config&&me.config.pinned);
	},
	isArchived:function(){
		var me=this;
		return !!(me.config&&me.config.archived);
	},
	isPublished:function(){
		return true;
	},
	_getParentItemIdType:function(){

		var me=this;

		return {
			itemId:(me.config.item&&me.config.item.getId)?me.config.item.getId():me.config.itemId,
			itemType:(me.config.item&&me.config.item.getType)?me.config.item.getType():me.config.itemType
		}
	},
	save:function(cb){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'save_'+(me.getType().split('.').pop()), Object.append(me.config, Object.append({
			plugin:"ProjectHub",

			id:me.getId(),
			name:me.getName(),
			description:me.getDescription()
		
		}, me._getParentItemIdType())))).addEvent('success',function(response){

			me._id=response.id;

			if(cb){
				cb(true);
			}
			me.fireEvent('save');

		}).execute();


	},
	destroy:function(cb){

		var me=this;

		(new AjaxControlQuery(CoreAjaxUrlRoot, 'delete_'+(me.getType().split('.').pop()), {
			plugin:"ProjectHub",
			id:me.getId()
		})).addEvent('success',function(response){

			me.remove();
			if(cb){
				cb(true);
			}

		}).execute();

	},
	remove:function(){
		var me=this;
		me.fireEvent('remove');
	}

});


var ProfileItem=new Class({
	Extends:EventItem,


	getType:function(){
		return 'ProjectHub.profile';
	},
	hasIcon:function(){
		if(this.config.attributes&&this.config.attributes.profileIcon){
			var images = JSTextUtilities.ParseImages(this.config.attributes.profileIcon);
			return images.length>0;
		}
		return false;
	},
	getIcon:function(){
		if(this.config.attributes&&this.config.attributes.profileIcon){
			var images = JSTextUtilities.ParseImages(this.config.attributes.profileIcon);
			return images[0].url
		}
		return false;
	}
})

var MyProfileItem=new Class({
	Extends:ProfileItem,
	getActions:function(){
		if(AppClient.getUserType()!=="guest"){
			return ['logout', 'edit'];
		}
		return ["login"];
	},
	logout:function(){

		if(AppClient.getUserType()=="guest"){
		    return;
		}

	    AppClient.logout();


	},
	isPublished:function(){
		return this.config.published;
	},
	setPublished:function(bool){
		this.config.published=bool;
	},
	canCreate:function(name){
		if(AppClient.getUserType()!=="guest"){
			if(this.isPublished()){
				return (['project', 'connection', 'request', 'event']).indexOf(name)>=0;
			}
			return (['publish']).indexOf(name)>=0;
			
		}
		return false;
	},
	_getParentItemIdType:function(){

		var me=this;

		return {
			item:AppClient.getId(),
			itemType:"user"
		}
	}
});



var ProjectItem=new Class({
	Extends:EventItem,
	

	
	getType:function(){
		return 'ProjectHub.project';
	},
	canCreate:function(name){
		if(AppClient.getUserType()=="admin"){
			return (['project','connection', 'request', 'event']).indexOf(name)>=0;
		}
		return false;
	},
})

var ConnectionPlaceholderItem=new Class({
	Extends:EventItem,
	getType:function(){
		return 'ProjectHub.empty';
	}
});


var ConnectionItem=new Class({
	Extends:EventItem,

	canCreateConnectionFrom:function(itemA){
		return false;
	},

	
	_getParentItemIdType:function(){

		var me=this;

		var parentItem=me.parent();


		if(me.config.itemIdB&&me.config.itemTypeB){
			parentItem.itemIdB=me.config.itemIdB;
			parentItem.itemTypeB=me.config.itemTypeB;
		}

		if(me.config.itemB){

			parentItem.itemIdB=me.config.itemB.getId();
			parentItem.itemTypeB=me.config.itemB.getType();
		}

		return parentItem

	},
	hasOwner:function(){
		var me=this;
		if(me instanceof ProfileItem){
			return false;
		}
		if(me.config.itemIdA&&me.config.itemTypeA){
			return true;
		}
		return false;


	},
	getOwner:function(){
		var me=this;

		if(me.config.itemIdA&&me.config.itemTypeA){
			if(EventList.SharedInstance().hasItem(me.config.itemIdA,me.config.itemTypeA)){
				var ownerItem= EventList.SharedInstance().getItem(me.config.itemIdA,me.config.itemTypeA);
				return ownerItem;
				
			}
			throw 'Owner item is set but is not available..! ';
		}
		throw 'No Owner!';
	},
	isConnected:function(){

		var me=this;
		if(me.config.itemIdB&&me.config.itemTypeB){
			return true;
		}

		if(me.config.itemB){

			return true;
		}

		return false;

	},
	getConnectionTo:function(){

		var me=this;
		if(me.config.itemB){

			return me.config.itemB;
		}

		if(me.config.itemIdB&&me.config.itemTypeB){
			if(EventList.SharedInstance().hasItem(me.config.itemIdB,me.config.itemTypeB)){
				return EventList.SharedInstance().getItem(me.config.itemIdB,me.config.itemTypeB);
			}
			throw 'Connection item is set but is not available..! ';
		}

		

		throw 'No Connection To!';

	},

	hasOwner:function(){
		var me=this;
		if(me instanceof ProfileItem){
			return false;
		}
		if(me.config.itemIdA&&me.config.itemTypeA){
			return true;
		}
		return false;


	},
	getOwnersProfile:function(){
		var me=this;
		if(me.config.itemIdA&&me.config.itemTypeA){
			if(EventList.SharedInstance().hasItem(me.config.itemIdA,me.config.itemTypeA)){
				var ownerItem= EventList.SharedInstance().getItem(me.config.itemIdA,me.config.itemTypeA);
				if(ownerItem instanceof ProfileItem){
					return ownerItem;
				}
				return ownerItem.getOwnersProfile();
			}
			throw 'Owner item is set but is not available..! ';
		}
		throw 'No Owner!';

	},
	
	
	getType:function(){
		return 'ProjectHub.connection';
	},
	getItemA:function(){

		var me=this;
		if(me.config&&me.config.item instanceof EventItem){

			//this is set for new unsaved items not previously saved items

			return me.config.item;
		}

		if(me.config&&me.config.itemIdA&&me.config.itemTypeA){
			return EventList.SharedInstance().getItem(me.config.itemIdA, me.config.itemTypeA);
		}

		return new ConnectionPlaceholderItem();
	},
	getItemB:function(){
		var me=this;
		if(me.config&&me.config.itemB instanceof EventItem){

			//this is set for new unsaved items not previously saved items

			return me.config.itemB;
		}

		if(me.config&&me.config.itemIdB&&me.config.itemTypeB){
			return EventList.SharedInstance().getItem(me.config.itemIdB, me.config.itemTypeB);
		}

		return new ConnectionPlaceholderItem({name:"Empty Connection"});
	}
})

var ConnectionRequestItem=new Class({
	Extends:EventItem,

	
	getType:function(){
		return 'ProjectHub.request';
	}
})




EventItem.CreateActionButtons=function(item, application){

	EventItem._application=application;

	if(!EventItem.Confirm){
		EventItem.Confirm=function(question, callback){

			(new UIModalDialog(application, question, {
					"formName":"dialogForm",
					"formOptions":{
						"template":"form",
						"className":"confirm-view"
					}
				})).show(callback);
		}

		EventItem.Alert=function(question, callback){

			(new UIModalDialog(application, question, {
					"formName":"dialogForm",
					"formOptions":{
						"template":"form",
						"className":"alert-view"
					}
				})).show(callback);

		}

	}

	return item.getActions().map(function(action){

		

		return new Element('button',{"class":"btn-action action-"+action+(action=="delete-disabled"?" action-delete":""), title:action, events:{click:function(e){
			e.stop();
			if((item[action]&&typeof item[action]=='function')||action==='login'){

				if(AppClient.getUserType()=="guest"){
					var wizard=application.getDisplayController().displayPopoverForm(
						"loginForm", 
						AppClient, 
						application,
						{"template":"form"}
					);
					return;
				}



				item[action]();
				return;
			}


			if(action==='edit'){
				
				var formName=item.getType().split('.').pop()+"Form";
					
				var wizard=application.getDisplayController().displayPopoverForm(
					formName, 
					item, 
					application,
					{
						"template":"form",
						"className":item.getType().split('.').pop()+"-form"
					}
				);

				return;
			}

			if(action==='delete'){


				EventItem.Confirm(
					"Are you sure you want to delete this item", 
					function(userAccepted){

						if(userAccepted){
							item.destroy();
						}

				});

				

				return;
			}

			if(action==='delete-disabled'){
				
				EventItem.Alert(
					"Unable to do this", 
					function(userAccepted){

				});


				return;
			}

			if(action==='focus'){
				
				application.getNamedValue('navigationController').navigateTo("FeedItems", "Main");

				return;
			}

			console.warn('item does not define function named: '+action);
			
		}}});
	});

};

EventItem.SetActiveItem=function(item){

	if(EventItem._activeItem&&item!==EventItem._activeItem){
		EventItem.ClearActiveItem();
	}
	EventItem._application.getNamedValue('navigationController').addUrlSegment(item.getType().split('.').pop()+'-'+item.getId());
	EventItem._activeItem=item;
}
EventItem.ClearActiveItem=function(){
	if(EventItem._activeItem){
		if(EventItem._activeItem.isActive()){

			EventItem._application.getNamedValue('navigationController').removeUrlSegment(EventItem._activeItem.getType().split('.').pop()+'-'+EventItem._activeItem.getId());

			EventItem._activeItem.deactivate();
		}
		EventItem._activeItem=null;
	}
}

EventItem.GetActiveItem=function(){
	if(EventItem._activeItem){
		return EventItem._activeItem;
	}
	return null;
}
EventItem.DefaultTags=function(item, application){


	return ['one', 'two', 'three'];


}
EventItem.CreateTagFilterButtons=function(item, application){

	EventItem._application=application;

	return item.getTags().map(function(tag){

		var current=application.getNamedValue('tagFilter');
		isActive='';
		if(current&&current.tags&&current.tags.indexOf(tag)>=0){
			isActive=' active';
		}

		return new Element('button',{"class":"btn-tag tag-"+tag+isActive, html:tag, title:tag, events:{click:function(e){

			application.setNamedValue('tagFilter',{tags:[tag]});
			application.getNamedValue('navigationController').navigateTo("Tags", "Main");

			e.stop();
			


		}}});
	});

};


EventItem.CreateItemIcon=function(item, application){
	
	var icon= new ElementModule('div',{"class":"feed-item-icon"});

	if(item.hasIcon()){
	    icon.getElement().addClass('user-icon');
	    icon.getElement().setStyle("background-image","url('"+item.getIcon()+"?thumb=>60x>60')");
	}

	if(item instanceof ConnectionItem&&item.isConnected()){
	    var connectedTo=item.getConnectionTo();
	    if(connectedTo.hasIcon()){
	        icon.getElement().addClass('user-icon connection-icon');
	        icon.getElement().setStyle("background-image","url('"+connectedTo.getIcon()+"?thumb=>60x>60')");
	        
	        icon.getElement().appendChild(new Element('div',{"class":"feed-item-icon"}))
	    }
	}

	if(item.getType()==="ProjectHub.event"&&item.hasEventDate()){
	    icon.getElement().setAttribute('data-event-day', item.getEventDay());
	}


	if(item instanceof MyProfileItem){
		icon.getElement().addEvent('click',function(e){

			e.stop();
			//EventList.SharedInstance(function(el){
				//resolve profile item!
				//
				var feeditem=EventList.SharedInstance().getItem(item);
				if(feeditem.isActive()&&nav.getCurrentView().view=="Single"){
			        return;
			    }
			    
			    feeditem.activate();
				application.getNamedValue('navigationController').navigateTo("Single", "Main");
			//})
			
		});
	}


	return icon;



}

