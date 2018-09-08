<?php

namespace ProjectHub;

/**
 * Generates SEO metadata for ProjectHub items. 
 */
class DocumentMetadata{

	private $currentUrl=null;
	private $currentItem=null;


	
	
	/**
	 * Generates a site title for the (current) url
	 * @param  string $url (optional) site url, if empty then the current url is used from request variables
	 * @return string      formatted site title
	 */
	public function getSiteTitle($url=null){

		
		$url=$this->getUrl($url);
	

		if($this->isItemUrl($url)){
			$item=$this->getUrlItem($url);
			return $item->name;
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
			return $item->description;
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
		return GetPlugin('ProjectHub')->listFeedItemsAjax();
	}



	private function getUrl($url=null){
		if(!$url){
			$url=trim($_SERVER['REQUEST_URI'],'/');
		}


		if($this->currentUrl&&$this->currentUrl!==$url){
			$this->currentItem=null;
		}

		$this->currentUrl=$url;
		return $url;
		 
	}

	private function getUrlItem($url){

		if($this->currentUrl&&$this->currentUrl==$url){
			if($this->currentItem){
				return $this->currentItem;
			}
		}

		$parts=explode('/', $url);
		$itemStr=$parts[1];
		$parts=explode('-', $itemStr);
		$type=$parts[0];
		$feedItemId=intval($parts[1]);

		$getType='get'.ucfirst($type);
		if($result=GetPlugin('ProjectHub')->getDatabase()->$getType($feedItemIds)){
			$this->currentItem=$result[0];
			return $result[0];
		}

		return false;


	}


	private function isItemUrl($url){
		return strpos($url,'Single/')===0;
	}



}