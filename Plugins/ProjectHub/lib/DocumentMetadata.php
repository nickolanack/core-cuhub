<?php

namespace ProjectHub;

class DocumentMetadata{

	private $currentUrl=null;
	private $currentItem=null;

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

	public function getSiteTitle($url=null){

		
		$url=$this->getUrl($url);
	

		if($this->isItemUrl($url)){
			$item=$this->getUrlItem($url);
			return $item->name;
		}
		
		
		return 'CUHub Project Portal';

	}

	private function isItemUrl($url){
		return strpos($url,'Single/')===0;
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
		$id=intval($parts[1]);

		$getType='get'.ucfirst($type);
		if($result=GetPlugin('ProjectHub')->getDatabase()->$getType($id)){
			$this->currentItem=$result[0];
			return $result[0];
		}

		return false;


	}


	public function getSiteDescription($url=null){

	
		$url=$this->getUrl($url);
	

		if($this->isItemUrl($url)){
			$item=$this->getUrlItem($url);
			return $item->description;
		}
		
	
		
		return 'The CUHub Project Portal allows researchers and communities to collaborate on local projects';

	}


	public function renderFeedItemIndex($list=null, $url=null){




		if(!$list){
			$list=GetPlugin('ProjectHub')->listFeedItemsAjax();
		}

		
		

		return (new \core\Template('feeditem.index.html', 'Feed Items List'))
                        ->render($list);

	}



}