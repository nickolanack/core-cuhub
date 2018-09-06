<?php


namespace Plugin;

/**
 * ProjectHub website plugin. Manages publishable 'feeditems' consisting of primarily of profiles, projects and events. 
 * 
 * An additional feeditem type, 'connection' can be made from profiles to other primary types to create a web/graph.  
 * projects and events all have a root profile (can be created by a user/profile). and projects can have sub projects and events
 *
 * For logged in users, feed items can be pinned and archived
 */
class ProjectHub extends \Plugin implements 
	\core\AjaxControllerProvider, \core\DatabaseProvider, \core\ViewController, \core\PluginDataTypeProvider, \core\EventListener {
		
	use \core\AjaxControllerProviderTrait;
	use \core\DatabaseProviderTrait;
	use \core\PluginDataTypeProviderTrait;
	use \core\EventListenerTrait;

	protected $name = 'Project Hub Plugin';
	protected $description = 'Provides project and connection management';



	/**
	 * searches and returns of list of feeditems containing the keyword in the name
	 * @param  string $searchKeyword some search keyword
	 * @return array feeditem list
	 */
	public function searchFeedItems($searchKeyword){

		return $this->listFeedItems(array('name'=>array(
			'value'=>'%'.$searchKeyword.'%',
			'comparator'=>'LIKE'
		)));

	}

	/**
	 * TODO: this is using sampleResults!
	 * returns the list of pinned feeditems
	 * @return array feeditem list
	 */
	public function listPinnedFeedItems() {
		return array_map(function ($item) {

			$item['pinned'] = true;
			return $item;

		}, json_decode(file_get_contents(__DIR__ . '/samplePinned.json'), true));
	}

	/**
	 * TODO: this is using sampleResults!
	 * returns the list of archived feeditems
	 * @return array feeditem list
	 */
	public function listArchivedFeedItems() {
		return array_map(function ($item) {

			$item['archived'] = true;
			return $item;

		}, json_decode(file_get_contents(__DIR__ . '/samplePinned.json'), true));
	}


	/**
	 * returns the list of feeditems formatted for an ajax response. 
	 * ie: ["results"=>array, "subscription"=>array];
	 * @return array feeditem list ajax response
	 */
	public function listFeedItemsAjax(){

		$response=array('results'=>$this->listFeedItems());




        $userCanSubscribe = !GetClient()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'eventfeed.'.GetClient()->getUserId()=>'update',
                'eventlist'=>'update',
            );
        }

        return $response;



	}

	/**
	 * returns the list of formatted (possibly filtered) feeditems
	 * @return array feeditem list
	 */
	public function listFeedItems($filter=array()) {

		GetPlugin('Attributes');

		$filter['ORDER BY'] = 'createdDate DESC';

		$projects = $this->getDatabase()->getProjects($filter);
		$events = $this->getDatabase()->getEvents($filter);
		$connections = $this->getDatabase()->getConnections($filter);
		$requests = $this->getDatabase()->getRequests($filter);
		$profiles = $this->getDatabase()->getProfiles(array_merge(array("published" => true), $filter));

		return array_merge(
			array_map(function ($record) {

				return $this->_feedItem($record ,"project");

			}, $projects),
			array_map(function ($record) {

				return $this->_feedItem($record ,"event");

			}, $events),
			array_map(function ($record) {

				return $this->_feedItem($record ,"connection");


			}, $connections),
			array_map(function ($record) {

				return $this->_feedItem($record ,"request");

			}, $requests),

			array_map(function ($record) {

				
				$profile = $this->_feedItem($record ,"profile");
				$profile["attributes"]=(new \attributes\Record('profileAttributes'))->getValues($profile['id'], $profile["type"]);
				return $profile;

			}, $profiles) //,
			//json_decode(file_get_contents(__DIR__.'/sampleFeed.json'),true)
			//$this->listPinnedFeedItems(),
			//$this->listArchivedFeedItems()
		);

	}

	/**
	 * get the list of feeditem types
	 * @return array types
	 */
	public function getFeedTypes(){

		return array('project','event','connection','request','profile');

	}

	
	/**
	 * 
	 * returns a single formatted feeditem given the id and type
	 * @param  int $id   database id
	 * @param  string $type must be a valid type @see getFeedTypes
	 * @return array     formatted feeditem
	 */
	public function getFeedItemRecord($id, $type){
		if(!in_array($type, $this->getFeedTypes())){
			throw new \Exception('Invalid type: '.$type);
		}

		$method='get'.ucfirst($type);
		if($records=$this->getDatabase()->$method($id)){
			return $this->_feedItem($records[0], $type);
		}

		throw new \Exception('Invalid item: '.$id.' '.$type);


	}

	/**
	 *   
	 * returns a single formatted profile feeditem (current users profile). creating it if it does not exist
	 * @param  int $id (optional) user id, if
	 * @return array     formatted feeditem
	 */
	public function currentUsersProfileItem() {

	

		$client=GetClient();
		$userid=$client->getUserId();
		if($client->isGuest()){

		}

		$profile=false;

		if ($profiles = $this->getDatabase()->getProfiles(array("itemId" => $userid))) {
			$profile = get_object_vars($profiles[0]);
		}

		if(!$profile){
			$id=$this->getDatabase()->createProfile($fields=array(

	            'itemType'=>"user",
	            'itemId'=>$client->getUserId(),

	            'name'=>$client->getRealName(),
	            'description'=>"",

	            'metadata'=>json_encode((object)array()),
	            'createdDate'=>$now=date('Y-m-d H:i:s'),
	            'modifiedDate'=>$now,
	            "readAccess"=>"public",
	            "writeAccess"=>"registered",
	            "published"=>false,
	            'publishedDate'=>$now,

	        ));
	        $profile=array_merge($fields, array('id'=>$id));
		}
		
		

		$profile["type"] = "ProjectHub.profile";
		$profile["published"] = boolval($profile["published"]);


		GetPlugin('Attributes');
		$profile["attributes"]=(new \attributes\Record('profileAttributes'))->getValues($profile['id'], $profile["type"]);

		return $profile;
		


	}

	public function printFeedItemLinksHtml($list=null){

		include_once __DIR__.'/lib/DocumentMetadata.php';
		$documentMetadata=new \ProjectHub\DocumentMetadata();
		?><noscript><?php
			echo $documentMetadata->renderFeedItemIndex();
		?></noscript><?php
	}

	public function setDocumentMetadata(){

		include_once __DIR__.'/lib/DocumentMetadata.php';
		$documentMetadata=new \ProjectHub\DocumentMetadata();
		HtmlDocument()->META($documentMetadata->getSiteTitle(), 'title');
		HtmlDocument()->META($documentMetadata->getSiteDescription(), 'description');
	}

	/**
	 * Uses system methods to include javascript dependencies.
	 * This should be called by the root DetailView 
	 */
	public function includeScripts() {

		IncludeJS(__DIR__ . '/js/EventList.js');
		IncludeJS(__DIR__ . '/js/EventItem.js');
		IncludeJS('{core}/bower_components/moment/moment.js');

	}



	protected function onPost($args){


		
		$discussionId=$args->discussion;
		$discussionMeta=GetPlugin("Discussions")->getDiscussionMetadata($discussionId);
		$itemId=$discussionMeta["itemId"];
		$itemType=$discussionMeta["itemType"];

		Emit("onHubRepost", $eventData=array(
			"args"=>$args,
			"discussion"=>$discussionMeta
		));

		if(strpos($itemType, "ProjectHub.")===0){

			$p=explode(".", $itemType);
			$type=$p[1];
			
			
			Emit("onHubPost", $eventData=array(
				"text"=>$args->text,
				"post"=>$args->id,
				"discussion"=>$args->discussion,
				"item"=>$this->getFeedItemRecord($itemId, $type),
				"pinners"=>$this->_getPinners($itemId, $itemType)
			));
			
			Emit("on".ucfirst($type)."Post", $eventData);

			$name=GetClient()->isGuest()?"a guest user":GetClient()->getUsername();

			$eventData['action']=array(
				"label"=>$name." posted the following comment:",
				"content"=>$args->text,
				"action"=>"posted to",
				
			);
			
			$eventData['sandboxed']=true;

			if(!$eventData['sandboxed']){

			}else{
				GetPlugin('Email')->getMailerWithTemplate("pinned.update", $eventData)->to("nickblackwell82@gmail.com")->send();
				GetPlugin('Email')->getMailerWithTemplate($type.".update", $eventData)->to("nickblackwell82@gmail.com")->send();
			}

			

		}


	}

	private function _getPinners($id, $type){

		$pins = $this->getDatabase()->getWatchs(array(
			"itemId"=> $id,
			"itemType"=>$type,
			"watchType"=>"pin"
		));
		// return array(
		// 	$pins,
		// 	$this->getDatabase()->lastQuery()
		// );

		if($pins){
			return array_map(function($r){
				return GetClient()->userMetadataFor($r->uid);
			},$pins);
		}

		return array();

	}





	private function _feedItem($record ,$type){

		if(!in_array($type, $this->getFeedTypes())){
			throw new \Exception('Invalid type: '.$type);
		}

		$record = get_object_vars($record);
		$record["type"] = "ProjectHub.".$type;

		$record["link"]="/Single/".$type."-".$record["id"];

		return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record), $this->_getAttributesForRecord($record));

	}	

	private function _getPinsForRecord($record){

		$result=array('pinned'=>false);

		$pins=$this->getDatabase()->getWatchs(array(
			"uid"=>GetClient()->getUserId(),
			"itemType"=>$record["type"],
			"itemId"=>$record['id'],
			"watchType"=>"pin"
		));
		if($pins){
			$result["pinned"]=true;
		}

		$result['numberofpins']=$this->getDatabase()->countWatchs(array(
			"itemType"=>$record["type"],
			"itemId"=>$record['id'],
			"watchType"=>"pin"
		));


		return $result;
	}
	private function _getArchivedForRecord($record){

		$result=array("archived"=>false);

		$archived=$this->getDatabase()->getIgnores(array(
			"uid"=>GetClient()->getUserId(),
			"itemType"=>$record["type"],
			"itemId"=>$record['id'],
			"ignoreType"=>"archive"
		));
		if($archived){
			$result["archived"]=true;
		}

		$result['numberofarchives']=$this->getDatabase()->countIgnores(array(
			"itemType"=>$record["type"],
			"itemId"=>$record['id'],
			"ignoreType"=>"archive"
		));

		return $result;
	}

	private function _getAttributesForRecord($record){

		
		GetPlugin('Attributes');

		return array('attributes'=>(new \attributes\Record('eventAttributes'))->getValues($record['id'], $record["type"]));

	}


	
}
