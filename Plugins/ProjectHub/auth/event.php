<?php

namespace DataType;

class Event extends \core\DataType{





	public function authorize($task, $item)
    {
        if (GetClient()->isAdmin()) {
            return true;
        }

        if($task=='read'){
        	return true;
		}

		if($results=GetPlugin('ProjectHub')->getDatabase()->getEvent((int) $item)){
			return Auth($task, $results[0]->itemId, $results[0]->itemType);
		}

        //error_log(print_r($results,true));

		return false;

    }


}