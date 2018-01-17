




var EventItem=new Class({

	Extends:DataTypeObject,

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

	canCreate:function(name){
		return false;
	},

	pin:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'pin_item', {

			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			
		}).execute();


	},
	unpin:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'unpin_item', {
			
			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			
		}).execute();


	},
	archive:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'archive_item', {

			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			
		}).execute();


	},
	unarchive:function(){

		var me=this;
		(new AjaxControlQuery(CoreAjaxUrlRoot, 'unarchive_item', {
			
			plugin:"ProjectHub",
			itemId:me.getId(),
			itemType:me.getType()
	
		})).addEvent('success',function(response){

			
		}).execute();


	},
	getActions:function(){
		var actions=[
			this.isPinned()?'unpin':'pin', 
			this.isArchived()?'unarchive':'archive', 
		];
		 
		if(AppClient.getUserType()=="admin"){
			actions.push('edit');
			actions.push('delete');
		}
		return actions;
	},

	getTags:function(){
		return ['tagA', 'tagB'];
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
			itemId:(me.config.item&&me.config.item.getId)?me.config.item.getId():me.config.item,
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

			cb(true);

		}).execute();


	},
	destroy:function(){

		var me=this;

		(new AjaxControlQuery(CoreAjaxUrlRoot, 'delete_'+(me.getType().split('.').pop()), {
			plugin:"ProjectHub",
			id:me.getId()
		})).addEvent('success',function(response){

			cb(true);

		}).execute();

	}

});


var ProfileItem=new Class({
	Extends:EventItem,

	getTags:function(){
		return ['tagI','tagJ'];
	},
	getType:function(){
		return 'ProjectHub.profile';
	}
})

var MyProfileItem=new Class({
	Extends:ProfileItem,
	getActions:function(){
		if(AppClient.getUserType()!=="guest"){
			return ['logout', 'edit'];
		}
		return [];
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
	},
	getTags:function(){
		return [];
	}
})


var ProjectItem=new Class({
	Extends:EventItem,
	

	getTags:function(){
		return ['tagC', 'tagD', 'tagD'];
	},
	getType:function(){
		return 'ProjectHub.project';
	},
	canCreate:function(name){
		if(AppClient.getUserType()=="admin"){
			return (['connection', 'request', 'event']).indexOf(name)>=0;
		}
		return false;
	},
})


var ConnectionItem=new Class({
	Extends:EventItem,
	

	
	getTags:function(){
		return ['tagE', 'tagF'];
	},
	getType:function(){
		return 'ProjectHub.connection';
	}
})

var ConnectionRequestItem=new Class({
	Extends:EventItem,

	getTags:function(){
		return ['tagG', 'tagH'];
	},
	getType:function(){
		return 'ProjectHub.request';
	}
})

EventItem.CreateActionButtons=function(item, application){



	return item.getActions().map(function(action){

		

		return new Element('button',{"class":"btn-action action-"+action, title:action, events:{click:function(e){
			e.stop();
			if(item[action]&&typeof item[action]=='function'){

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
					{"template":"form"}
				);

				return;
			}

			if(action==='delete'){
				
				if(confirm('are you sure you want to delete this item')){

					item.destroy();

				}

				return;
			}

			console.warn('item does not define function named: '+action);
			
		}}});
	});

};

EventItem.CreateTagFilterButtons=function(item, application){



	return item.getTags().map(function(tag){
		return new Element('button',{"class":"btn-tag tag-"+tag, html:tag, title:tag, events:{click:function(e){
			e.stop();
			


		}}});
	});

};

