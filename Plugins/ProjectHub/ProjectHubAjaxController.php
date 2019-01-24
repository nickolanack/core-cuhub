<?php

class ProjectHubAjaxController extends core\AjaxController implements core\PluginMember {
	use core\PluginMemberTrait;

	protected function search($json) {

		return array('results' => $this->getPlugin()->searchFeedItems($json->search));

	}

	protected function sendDirectMessage($json) {

		Emit('onSendDirectMessageVerification',
			$json
		);
		$links = GetPlugin('Links');
		$clientToken = $links->createLinkEventCode('onVerifyDirectMessage', $json);
		$linkUrl = HtmlDocument()->website() . '/' . $links->actionUrlForToken($clientToken);

		//$linkUrl=HtmlDocument()->website().'/'.$this->getPlugin()->urlForView("magiclink", array("token"=>$clientToken));

		// if(($magicLinkUrl=$this->getPlugin()->getParameter("magicLinkUrl", ""))&&(!empty($magicLinkUrl))){
		//      $linkUrl=HtmlDocument()->website().'/'.$magicLinkUrl."?token=".$clientToken;
		// }

		//HtmlDocument()->website().'/'.$links->actionUrlForToken($clientToken);
		$typeParts = explode(".", $json->itemType);
		$type = $typeParts[1];
		$item = $this->getPlugin()->getFeedItemRecord($json->itemId, $type);

		$eventData = array_merge(
			array(
				"link" => $linkUrl,
				"profile" => $item,
			),
			get_object_vars($json));

		//GetPlugin('Email')->getMailerWithTemplate("email.verify.directMessage", $eventData)->to("nickblackwell82@gmail.com")->send();
		GetPlugin('Email')->getMailerWithTemplate("email.verify.directMessage", $eventData)->to($json->email)->send();

		return true;

	}

	protected function listFeedItems() {

		return $this->getPlugin()->listFeedItemsAjax();

	}

	protected function usersProfile() {

		return array('result' => $this->getPlugin()->currentUsersProfileItem());

	}

	protected function listPinnedFeedItems() {

		$response = array('results' => $this->getPlugin()->listPinnedFeedItems());

		$userCanSubscribe = !GetClient()->isGuest();
		if ($userCanSubscribe) {
			$response['subscription'] = array(
				'channel' => 'pinnedfeed.' . GetClient()->getUserId(),
				'event' => 'update',
			);
		}

		return $response;

	}

	protected function listArchivedFeedItems() {

		$response = array('results' => $this->getPlugin()->listArchivedFeedItems());

		$userCanSubscribe = !GetClient()->isGuest();
		if ($userCanSubscribe) {
			$response['subscription'] = array(
				'channel' => 'pinnedfeed.' . GetClient()->getUserId(),
				'event' => 'update',
			);
		}

		return $response;

	}

	private function defaultItemData($json) {
		return array(
			'name' => $json->name,
			'description' => $json->description,

			'metadata' => json_encode((object) array()),
			'createdDate' => $now = date('Y-m-d H:i:s'),
			'modifiedDate' => $now,
			"readAccess" => "public",
			"writeAccess" => "registered",
		);
	}

	private function defaultUpdateItemData($json) {

		return array(
			'id' => $json->id,
			'name' => $json->name,
			'description' => $json->description,
			'modifiedDate' => date('Y-m-d H:i:s'),
		);

	}

	private function setItemAttributes($itemId, $itemType, $json) {

		if (key_exists('attributes', $json)) {

			foreach ($json->attributes as $table => $fields) {
				(new \attributes\Record($table))->setValues($itemId, $itemType, $fields);
			}
		}

	}

	protected function saveProject($json) {

		if ($json->id > 0) {

			$this->getPlugin()->getDatabase()->updateProject($fields = $this->defaultUpdateItemData($json));

			Broadcast('eventlist', 'update', array(
				'event' => 'updated',
				'item' => $data = $this->getPlugin()->getFeedItemRecord($json->id, "project"),
			));

			return array('id' => $json->id, 'item' => $data);

		}

		$projectId = $this->getPlugin()->getDatabase()->createProject($fields = array_merge(array(

			'itemType' => $json->itemType,
			'itemId' => $json->itemId,

		), $this->defaultItemData($json)));

		Broadcast('eventlist', 'update', array(
			'event' => 'created',
			'item' => $data = $this->getPlugin()->getFeedItemRecord($projectId, "project"),
		));

		return array_merge(array('id' => $projectId, 'item' => $data));

	}

	protected function saveConnection($json) {

		if ($json->id > 0) {

			$this->getPlugin()->getDatabase()->updateConnection($fields = $this->defaultUpdateItemData($json));

			Broadcast('eventlist', 'update', array(
				'event' => 'updated',
				'item' => $data = $this->getPlugin()->getFeedItemRecord($json->id, "connection"),
			));

			return array('id' => $json->id, 'item' => $data);

		}

		$connectionId = $this->getPlugin()->getDatabase()->createConnection($fields = array_merge(array(

			'itemTypeB' => $json->itemTypeB,
			'itemIdB' => $json->itemIdB,

			'itemTypeA' => $json->itemType,
			'itemIdA' => $json->itemId,

		), $this->defaultItemData($json)));

		Broadcast('eventlist', 'update', array(
			'event' => 'created',
			'item' => $data = $this->getPlugin()->getFeedItemRecord($connectionId, "connection"),
		));

		return array_merge(array('id' => $connectionId, 'item' => $data));

	}

	protected function saveEvent($json) {

		if ($json->id > 0) {

			$this->getPlugin()->getDatabase()->updateEvent($fields = $this->defaultUpdateItemData($json));

			Broadcast('eventlist', 'update', array(
				'event' => 'updated',
				'item' => $data = $this->getPlugin()->getFeedItemRecord($json->id, "event"),
			));

			return array('id' => $json->id, 'item' => $data);

		}

		$eventId = $this->getPlugin()->getDatabase()->createEvent($fields = array_merge(array(

			'itemType' => $json->itemType,
			'itemId' => $json->itemId,

		), $this->defaultItemData($json)));

		Broadcast('eventlist', 'update', array(
			'event' => 'created',
			'item' => $data = $this->getPlugin()->getFeedItemRecord($eventId, "event"),
		));

		return array_merge(array('id' => $eventId, 'item' => $data));

	}

	protected function saveRequest($json) {

		if ($json->id > 0) {

			$this->getPlugin()->getDatabase()->updateRequest($fields = $this->defaultUpdateItemData($json));

			if (key_exists('attributes', $json)) {

			}

			Broadcast('eventlist', 'update', array(
				'event' => 'updated',
				'item' => $data = $this->getPlugin()->getFeedItemRecord($json->id, "request"),
			));

			return array('id' => $json->id, 'item' => $data);

		}

		$requestId = $this->getPlugin()->getDatabase()->createRequest($fields = array_merge(array(

			'itemType' => $json->itemType,
			'itemId' => $json->itemId,

		), $this->defaultItemData($json)));

		Broadcast('eventlist', 'update', array(
			'event' => 'created',
			'item' => $data = $this->getPlugin()->getFeedItemRecord($requestId, "request"),
		));

		return array_merge(array('id' => $requestId, 'item' => $data));

	}

	protected function saveProfile($json) {

		$now = date('Y-m-d H:i:s');

		if ($json->id > 0) {

			$fields = array(
				'id' => $json->id,
				'name' => $json->name,
				'description' => $json->description,
				'modifiedDate' => $now,
			);

			if ($json->published) {
				$profileRecord = $this->getPlugin()->getDatabase()->getProfile($json->id)[0];
				if (!boolval($profileRecord->published)) {
					$fields['published'] = true;
					$fields['publishedDate'] = $now;
				}
			}

			$this->getPlugin()->getDatabase()->updateProfile($fields);

			Broadcast('eventlist', 'update', array(
				'event' => 'updated',
				'item' => $data = $this->getPlugin()->getFeedItemRecord($json->id, "profile"),
			));

			return array('id' => $json->id, 'item' => $data);

		}

		$profileId = $this->getPlugin()->getDatabase()->createProfile($fields = array_merge(array(

			'itemType' => $json->itemType,
			'itemId' => $json->itemId,

			"published" => true,
			'publishedDate' => $now,

		), $this->defaultItemData($json)));

		Broadcast('eventlist', 'update', array(
			'event' => 'created',
			'item' => $data = $this->getPlugin()->getFeedItemRecord($profileId, "profile"),
		));

		return array_merge(array('id' => $profileId, 'item' => $data));

	}

	protected function deleteProject($json) {

		$item = $this->getPlugin()->getFeedItemRecord($json->id, "project");

		if ($this->getPlugin()->getDatabase()->deleteProject($json->id)) {

			Broadcast('eventlist', 'update', array(
				'event' => 'deleted',
				'item' => $item,
			));
			return true;

		}

		return false;
	}
	protected function deleteConnection($json) {

		$item = $this->getPlugin()->getFeedItemRecord($json->id, "connection");

		if ($this->getPlugin()->getDatabase()->deleteConnection($json->id)) {

			Broadcast('eventlist', 'update', array(
				'event' => 'deleted',
				'item' => $item,
			));
			return true;

		}

		return false;

	}
	protected function deleteRequest($json) {

		$item = $this->getPlugin()->getFeedItemRecord($json->id, "request");

		if ($this->getPlugin()->getDatabase()->deleteRequest($json->id)) {

			Broadcast('eventlist', 'update', array(
				'event' => 'deleted',
				'item' => $item,
			));
			return true;

		}

		return false;

	}
	protected function deleteEvent($json) {

		$item = $this->getPlugin()->getFeedItemRecord($json->id, "event");

		if ($this->getPlugin()->getDatabase()->deleteEvent($json->id)) {

			Broadcast('eventlist', 'update', array(
				'event' => 'deleted',
				'item' => $item,
			));
			return true;

		}

		return false;

	}
	protected function deleteProfile($json) {

		$item = $this->getPlugin()->getFeedItemRecord($json->id, "profile");

		if ($this->getPlugin()->getDatabase()->deleteProfile($json->id)) {

			Broadcast('eventlist', 'update', array(
				'event' => 'deleted',
				'item' => $item,
			));
			return true;

		}

		return false;

	}

	protected function pinItem($json) {

		$this->getPlugin()->getDatabase()->createUserPin(
			GetClient()->getUserId(),
			$json->itemType,
			$json->itemId
		);

		return true;

	}

	protected function unpinItem($json) {

		$this->getPlugin()->getDatabase()->deleteUserPin(
			GetClient()->getUserId(),
			$json->itemType,
			$json->itemId
		);

		return true;

	}

	protected function archiveItem($json) {

		$this->getPlugin()->getDatabase()->createUserArchiveItem(
			GetClient()->getUserId(),
			$json->itemType,
			$json->itemId
		);

		return true;

	}

	protected function unarchiveItem($json) {

		$this->getPlugin()->getDatabase()->deleteUserArchiveItem(
			GetClient()->getUserId(),
			$json->itemType,
			$json->itemId
		);

		return true;

	}

}
