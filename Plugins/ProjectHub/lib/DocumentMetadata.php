<?php

namespace ProjectHub;

/**
 * Generates SEO metadata for ProjectHub items. 
 */
class DocumentMetadata{

	private $currentUrl=null;
	private $currentItem=null;
	private $currentType=null;

	
	public function setPageMetadata(){

		HtmlDocument()->META($title=$this->getSiteTitle(), 'title');
		HtmlDocument()->META($title, "og:title",  array("name" => "property"));

		HtmlDocument()->META($description=$this->getSiteDescription(), 'description');
		HtmlDocument()->META($description, "og:description",  array("name" => "property"));
		
		HtmlDocument()->META($this->getLink(), "og:url",  array("name" => "property"));
		
		HtmlDocument()->META($image=$this->getImage(), "og:image",  array("name" => "property"));
		HtmlDocument()->META($this->getImage('/'), "og:image:alt",  array("name" => "property"));
		
		HtmlDocument()->META(\HtmlDocument()->getSiteName(), "og:site_name",  array("name" => "property"));
		HtmlDocument()->META($type=$this->getType(), "og:type",  array("name" => "property"));
		
		HtmlDocument()->META("843902265812603", "fb:app_id",  array("name" => "property"));
		 

		
		$ldJson=array(
			"@context"=>"http://schema.org/",
			"@type"=>$type,
			"name"=>$title,
			//"author"=>"Nick Blackwell",
			"image"=>$image,
			"description"=>$description
		);
		
		

		
		if($type=="profile"){
		

			$name=explode(' ', $title);

			HtmlDocument()->META($name[0], "profile:first_name",  array("name" => "property"));
			if(count($name)>1){
				HtmlDocument()->META($name[1], "profile:last_name",  array("name" => "property"));
			}

			HtmlDocument()->META($this->getAuthorUsername(), "profile:username",  array("name" => "property"));

			//$ldJson['author']=$name;
			$ldJson['@type']='Person';

			//profile:first_name - string - A name normally given to an individual by a parent or self-chosen.
			//profile:last_name - string - A name inherited from a family or marriage and by which the individual is commonly known.
			//profile:username - string - A short unique string to identify them.

		}

		if($this->currentType=="event"){

			$ldJson["@type"]="Event";
			$attributes=$this->currentItem['attributes'];
			$ldJson["startDate"]=trim($attributes['eventDate'].' '.$attributes['eventTime']);
			$ldJson["location"]=array(
				"@type"=>"Place",
				"name"=>$attributes['location'],
				"address"=>$attributes['location']
			);

			
		}

		// $ldJson["_type"]=$this->currentType;
		// $ldJson["_item"]=$this->currentItem;


		HtmlDocument()->META(json_encode($ldJson, JSON_PRETTY_PRINT),'ld+json');

	}

	public function getAuthorUsername($url=null){

		$url=$this->getUrl($url);
	

		if($this->isItemUrl($url)){
			$item=$this->getUrlItem($url);
			return GetClient()->userMetadataFor($item['itemId'])['username'];
		}

		return false;

	}

	public function getType($url=null){

		$this->getUrlItem($url);
		if($this->currentType=='profile'){
			return 'profile';
		}
		return 'website';
	}

	
	/**
	 * Generates a site title for the (current) url
	 * @param  string $url (optional) site url, if empty then the current url is used from request variables
	 * @return string      formatted site title
	 */
	public function getSiteTitle($url=null){

		
		$url=$this->getUrl($url);
	

		if($this->isItemUrl($url)){
			$item=$this->getUrlItem($url);
			return $item['name'];
		}
		
		
		return 'CUHub Project Portal';

	}


	

	/**
	 * Generates a site description for the (current) url
	 * @param  string $url (optional) site url, if empty then the current url is used from request variables
	 * @return string      formatted site description
	 */
	public function getSiteDescription($url=null){

	
		$url=$this->getUrl($url);
	

		if($this->isItemUrl($url)){
			$item=$this->getUrlItem($url);
			return strip_tags($item['description'].$item['attributes']['description']);
		}
		
	
		
		return 'The CUHub Project Portal allows researchers and communities to collaborate on local projects';

	}


	/**
	 * Generates (html) using a template for a list of feeditems for the current url.
	 * The content generated can be used to create an index page for SEO.
	 * 
	 * @param  array $list (optional) list of feeditems ie: GetPlugin('ProjectHub')->listFeedItems($filters);
	 * @param  string $url (optional) site url, if empty then the current url is used from request variables
	 * @param  string $template (optional) twig template to use, you can modify the template in the admin console
	 * @return string      html (generated from system template)
	 */
	public function renderFeedItemIndex($list=null, $url=null, $template='feeditem.index.html'){




		if(!$list){
			$list=$this->listFeedItems($url);
		}

		
		

		return (new \core\Template($template, 'Feed Items List'))
                        ->render($list);

	}

	private function listFeedItems($url=null){
		$url=$this->getUrl($url);
		//TODO use url to get feed item list!
		//
		return GetPlugin('ProjectHub')->listFeedItemsAjaxCache();
	}


	public function getLink($url=null){
		return HtmlDocument()->website().'/'.$this->getUrl($url);
	}

	public function getImage($url=null){
		return GetPlugin('ExternalContent')->getUrlScreenshot(HtmlDocument()->website().'/'.$this->getUrl($url), 1200, 1200);
	}

	private function getUrl($url=null){
		if(is_null($url)){
			$url=trim($_SERVER['REQUEST_URI'],'/');
		}


		if($this->currentUrl&&$this->currentUrl!==$url){
			$this->currentItem=null;
			$this->currentType=null;
		}

		$this->currentUrl=$url;
		return $url;
		 
	}

	private function getUrlItem($url){




		$url=$this->getUrl($url);

		
		if($this->currentItem){
			return $this->currentItem;
		}
		

		$parts=explode('/', $url);

		if(count($parts)<2){
			return false;
		}

		$itemStr=$parts[1];
		$parts=explode('-', $itemStr);
		if(count($parts)<2){
			return false;
		}
		$type=$parts[0];
		$feedItemId=intval($parts[1]);

		$projectHub=GetPlugin('ProjectHub');

		if(!in_array($type, $projectHub->getFeedTypes())){
			return false;
		}

		//$getType='get'.ucfirst($type);
		if($projectHub->hasFeedItem($feedItemId, $type)&&($item=$projectHub->getFeedItemRecord($feedItemId, $type))){
			$this->currentItem=$item;
			$this->currentType=$type;
			return $item;
		}

		return false;


	}


	private function isItemUrl($url){
		return strpos($url,'Single/')===0;
	}



}