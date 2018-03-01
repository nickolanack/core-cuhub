<?php


class RequestDataType extends core\DataType{


	public function getParentTypes() {

        return array(
            'event'
        ); 
    }

    public function authorize($task, $item)
    {
        if (GetClient()->isAdmin()) {
            return true;
        }

        if($task=='read'){
        	return true;
		}

		if($results=GetPlugin('ProjectHub')->getDatabase()->getRequest((int) $item)){
			return Auth($task, $results[0]->itemId, $results[0]->itemType);
		}

        //error_log(print_r($results,true));

		return false;

    }

}