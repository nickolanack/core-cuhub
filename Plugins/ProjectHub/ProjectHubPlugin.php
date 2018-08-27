<?php

/**
 * TODO: rename this plugin to MobileDevicePlugin
 */

class ProjectHubPlugin extends Plugin implements 
	core\AjaxControllerProvider, core\DatabaseProvider, core\ViewController, core\PluginDataTypeProvider, core\EventListener {
		
	use core\AjaxControllerProviderTrait;
	use core\DatabaseProviderTrait;
	use core\PluginDataTypeProviderTrait;
	use core\EventListenerTrait;

	protected $name = 'Project Hub Plugin';
	protected $description = 'Provides project and connection management';

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


	public function searchFeedItems($searchKeyword){

		return $this->listFeedItems(array('name'=>array(
			'value'=>'%'.$searchKeyword.'%',
			'comparator'=>'LIKE'
		)));

	}

	public function listPinnedFeedItems() {
		return array_map(function ($item) {

			$item['pinned'] = true;
			return $item;

		}, json_decode(file_get_contents(__DIR__ . '/samplePinned.json'), true));
	}

	public function listArchivedFeedItems() {
		return array_map(function ($item) {

			$item['archived'] = true;
			return $item;

		}, json_decode(file_get_contents(__DIR__ . '/samplePinned.json'), true));
	}

	public function listFeedItemsAjax(){

		$response=array('results'=>$this->listFeedItems());




        $userCanSubscribe = !Core::Client()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'eventfeed.'.Core::Client()->getUserId()=>'update',
                'eventlist'=>'update',
            );
        }

        return $response;



	}

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
				$profile["attributes"]=(new attributes\Record('profileAttributes'))->getValues($profile['id'], $profile["type"]);
				return $profile;

			}, $profiles) //,
			//json_decode(file_get_contents(__DIR__.'/sampleFeed.json'),true)
			//$this->listPinnedFeedItems(),
			//$this->listArchivedFeedItems()
		);

	}

	public function getFeedTypes(){

		return array('project','event','connection','request','profile');

	}

	public function _feedItem($record ,$type){

		if(!in_array($type, $this->getFeedTypes())){
			throw new Exception('Invalid type: '.$type);
		}

		$record = get_object_vars($record);
		$record["type"] = "ProjectHub.".$type;

		$record["link"]="/Single/".$type."-".$record["id"];

		return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record), $this->_getAttributesForRecord($record));

	}	

	public function getFeedItemRecord($id, $type){
		if(!in_array($type, $this->getFeedTypes())){
			throw new Exception('Invalid type: '.$type);
		}

		$method='get'.ucfirst($type);
		if($records=$this->getDatabase()->$method($id)){
			return $this->_feedItem($records[0], $type);
		}

		throw new Exception('Invalid item: '.$id.' '.$type);


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

		return array('attributes'=>(new attributes\Record('eventAttributes'))->getValues($record['id'], $record["type"]));

	}


	public function usersProfileItem($userid) {

	

		$client=GetClient();

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
		$profile["attributes"]=(new attributes\Record('profileAttributes'))->getValues($profile['id'], $profile["type"]);

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
}
