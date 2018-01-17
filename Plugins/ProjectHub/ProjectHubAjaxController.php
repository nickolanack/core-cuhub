<?php

class ProjectHubAjaxController extends core\AjaxController implements core\PluginMember
{
    use core\PluginMemberTrait;

    protected function listFeedItems($task, $json)
    {

     

        $response=array('results'=>$this->getPlugin()->listFeedItems());




        $userCanSubscribe = !Core::Client()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'channel' => 'eventfeed.'.Core::Client()->getUserId(),
                'event' => 'update',
            );
        }

        return $response;

    }

    protected function usersProfile($task, $json)
    {

     
        
        $response=array('result'=>$this->getPlugin()->usersProfileItem(GetClient()->getUserId()));




        
        return $response;

    }

    protected function listPinnedFeedItems($task, $json)
    {

     

        $response=array('results'=>$this->getPlugin()->listPinnedFeedItems());




        $userCanSubscribe = !Core::Client()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'channel' => 'pinnedfeed.'.Core::Client()->getUserId(),
                'event' => 'update',
            );
        }

        return $response;

    }

    protected function listArchivedFeedItems($task, $json)
    {

     

        $response=array('results'=>$this->getPlugin()->listArchivedFeedItems());




        $userCanSubscribe = !Core::Client()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'channel' => 'pinnedfeed.'.Core::Client()->getUserId(),
                'event' => 'update',
            );
        }

        return $response;

    }



    protected function saveProject($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateProject($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));

           return array('id'=>$json->id);

        }



            $id=$this->getPlugin()->getDatabase()->createProject($fields=array(

                'itemType'=>$json->itemType,
                'itemId'=>$json->itemId,
                'name'=>$json->name,
                'description'=>$json->description,
                'metadata'=>json_encode((object)array()),
                'createdDate'=>$now=date('Y-m-d H:i:s'),
                'modifiedDate'=>$now,
                "readAccess"=>"public",
                "writeAccess"=>"registered"

            ));

           return array_merge(array('id'=>$id));



    }


    protected function saveConnection($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateConnection($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));

           return array('id'=>$json->id);

        }



            $id=$this->getPlugin()->getDatabase()->createConnection($fields=array(

                'itemTypeA'=>$json->itemTypeA,
                'itemIdA'=>$json->itemA,

                'itemTypeB'=>$json->itemTypeB,
                'itemIdB'=>$json->itemB,


                'metadata'=>json_encode((object)array()),
                'createdDate'=>$now=date('Y-m-d H:i:s'),
                'modifiedDate'=>$now,
                "readAccess"=>"public",
                "writeAccess"=>"registered"

            ));

           return array_merge(array('id'=>$id));



    }


    protected function saveEvent($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateEvent($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));

           return array('id'=>$json->id);

        }



            $id=$this->getPlugin()->getDatabase()->createEvent($fields=array(

                'itemType'=>$json->itemType,
                'itemId'=>$json->itemId,

                'name'=>$json->name,
                'description'=>$json->description,

                'metadata'=>json_encode((object)array()),
                'createdDate'=>$now=date('Y-m-d H:i:s'),
                'modifiedDate'=>$now,
                "readAccess"=>"public",
                "writeAccess"=>"registered"

            ));

           return array_merge(array('id'=>$id));



    }

    protected function saveRequest($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateRequest($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));

           return array('id'=>$json->id);

        }



            $id=$this->getPlugin()->getDatabase()->createRequest($fields=array(

                'itemType'=>$json->itemType,
                'itemId'=>$json->itemId,

                'name'=>$json->name,
                'description'=>$json->description,

                'metadata'=>json_encode((object)array()),
                'createdDate'=>$now=date('Y-m-d H:i:s'),
                'modifiedDate'=>$now,
                "readAccess"=>"public",
                "writeAccess"=>"registered"

            ));

           return array_merge(array('id'=>$id));



    }

     protected function saveProfile($json){

        if($json->id>0){

            $fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>$now=date('Y-m-d H:i:s')
            );


            if($json->published){
               $p= $this->getPlugin()->getDatabase()->getProfile($json->id)[0];
               if(!boolval($p->published)){
                    $fields['published']=true;
                    $fields['publishedDate']=$now;
               }
            }


            $this->getPlugin()->getDatabase()->updateProfile($fields);

           return array('id'=>$json->id);

        }



            $id=$this->getPlugin()->getDatabase()->createProfile($fields=array(

                'itemType'=>$json->itemType,
                'itemId'=>$json->itemId,

                'name'=>$json->name,
                'description'=>$json->description,

                'metadata'=>json_encode((object)array()),
                'createdDate'=>$now=date('Y-m-d H:i:s'),
                'modifiedDate'=>$now,
                "readAccess"=>"public",
                "writeAccess"=>"registered",
                "published"=>false,
                'publishedDate'=>$now,

            ));

           return array_merge(array('id'=>$id));



    }


    protected function deleteProject($json){

        return $this->getPlugin()->getDatabase()->deleteProject($json->id);

    }
    protected function deleteConnection($json){

        return $this->getPlugin()->getDatabase()->deleteConnection($json->id);
        
    }
    protected function deleteRequest($json){

        return $this->getPlugin()->getDatabase()->deleteRequest($json->id);
        
    }
    protected function deleteEvent($json){

        return $this->getPlugin()->getDatabase()->deleteEvent($json->id);
        
    }
    protected function deleteProfile($json){

        return $this->getPlugin()->getDatabase()->deleteProfile($json->id);
        
    }



    protected function pinItem($json){

        $id=$this->getPlugin()->getDatabase()->createUserPin(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }

    protected function unpinItem($json){

        $id=$this->getPlugin()->getDatabase()->deleteUserPin(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }


    protected function archiveItem($json){

        $id=$this->getPlugin()->getDatabase()->createUserArchiveItem(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }

    protected function unarchiveItem($json){

        $id=$this->getPlugin()->getDatabase()->deleteUArchiveItem(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }


}
