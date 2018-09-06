<?php

namespace DataType;

class Connection extends \core\DataType{


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

		if($results=GetPlugin('ProjectHub')->getDatabase()->getConnection((int) $item)){
			return Auth($task, $results[0]->itemIdA, $results[0]->itemTypeA);
		}

        //error_log(print_r($results,true));

		return false;

    }


}