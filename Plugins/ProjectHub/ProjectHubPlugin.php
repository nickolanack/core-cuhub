<?php

/**
 * TODO: rename this plugin to MobileDevicePlugin
 */

class ProjectHubPlugin extends Plugin implements

core\AjaxControllerProvider, core\DatabaseProvider, core\ViewController {
	use core\AjaxControllerProviderTrait;
	use core\DatabaseProviderTrait;
	protected $name = 'Project Hub Plugin';
	protected $description = 'Provides project and connection management';

	public function includeScripts() {

		IncludeJS(__DIR__ . '/js/EventList.js');
		IncludeJS(__DIR__ . '/js/EventItem.js');
		IncludeJS('{core}/bower_components/moment/moment.js');


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
	public function listFeedItems() {

		$projects = $this->getDatabase()->getProjects(array('ORDER BY' => 'createdDate DESC'));
		$events = $this->getDatabase()->getEvents(array('ORDER BY' => 'createdDate DESC'));
		$connections = $this->getDatabase()->getConnections(array('ORDER BY' => 'createdDate DESC'));
		$requests = $this->getDatabase()->getRequests(array('ORDER BY' => 'createdDate DESC'));
		$profiles = $this->getDatabase()->getProfiles(array('ORDER BY' => 'createdDate DESC', "published" => true));

		return array_merge(
			array_map(function ($record) {

				$record = get_object_vars($record);
				$record["type"] = "ProjectHub.project";

				return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record));

			}, $projects),
			array_map(function ($record) {

				$record = get_object_vars($record);
				$record["type"] = "ProjectHub.event";
				return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record));

			}, $events),
			array_map(function ($record) {

				$record = get_object_vars($record);
				$record["type"] = "ProjectHub.connection";
				return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record));

			}, $connections),
			array_map(function ($record) {

				$record = get_object_vars($record);
				$record["type"] = "ProjectHub.request";
				return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record));

			}, $requests),
			array_map(function ($record) {

				$record = get_object_vars($record);
				$record["type"] = "ProjectHub.profile";
				return array_merge($record, $this->_getPinsForRecord($record), $this->_getArchivedForRecord($record));

			}, $profiles) //,
			//json_decode(file_get_contents(__DIR__.'/sampleFeed.json'),true)
			//$this->listPinnedFeedItems(),
			//$this->listArchivedFeedItems()
		);

	}

	private function _getPinsForRecord($record){
		$pins=$this->getDatabase()->getWatchs(array(
			"uid"=>GetClient()->getUserId(),
			"itemType"=>$record["type"],
			"itemId"=>$record['id'],
			"watchType"=>"pin"
		));
		if($pins){
			return array("pinned"=>true);
		}
		return array("pinned"=>false);
	}
	private function _getArchivedForRecord($record){
		$archived=$this->getDatabase()->getIgnores(array(
			"uid"=>GetClient()->getUserId(),
			"itemType"=>$record["type"],
			"itemId"=>$record['id'],
			"ignoreType"=>"archive"
		));
		if($archived){
			return array("archived"=>true);
		}
		return array("archived"=>false);
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
		return $profile;
		


	}
}
