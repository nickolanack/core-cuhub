<?php

class ProjectHubAjaxController extends core\AjaxController implements core\PluginMember
{
    use core\PluginMemberTrait;



    protected function search($json){

        $results=$this->getPlugin()->searchFeedItems($json->search);

        return array('results'=>$results);

    }


    protected function listFeedItems()
    {

        return $this->getPlugin()->listFeedItemsAjax();

        

    }

    protected function usersProfile()
    {

     
        
        $response=array('result'=>$this->getPlugin()->currentUsersProfileItem());




        
        return $response;

    }

    protected function listPinnedFeedItems()
    {

     

        $response=array('results'=>$this->getPlugin()->listPinnedFeedItems());




        $userCanSubscribe = !GetClient()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'channel' => 'pinnedfeed.'.GetClient()->getUserId(),
                'event' => 'update',
            );
        }

        return $response;

    }

    protected function listArchivedFeedItems()
    {

     

        $response=array('results'=>$this->getPlugin()->listArchivedFeedItems());




        $userCanSubscribe = !GetClient()->isGuest();
        if ($userCanSubscribe) {
            $response['subscription'] = array(
                'channel' => 'pinnedfeed.'.GetClient()->getUserId(),
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

            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "project")
            ));

           return array('id'=>$json->id);

        }



            $projectId=$this->getPlugin()->getDatabase()->createProject($fields=array(

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


            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($projectId, "project")
            ));

           return array_merge(array('id'=>$projectId));



    }


    protected function saveConnection($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateConnection($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));


            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "connection")
            ));

           return array('id'=>$json->id);

        }


      


            $connectionId=$this->getPlugin()->getDatabase()->createConnection($fields=array(

                'itemTypeA'=>$json->itemType,
                'itemIdA'=>$json->itemId,

                'itemTypeB'=>$json->itemTypeB,
                'itemIdB'=>$json->itemIdB,


                'metadata'=>json_encode((object)array()),
                'createdDate'=>$now=date('Y-m-d H:i:s'),
                'modifiedDate'=>$now,
                "readAccess"=>"public",
                "writeAccess"=>"registered",

                'name'=>$json->name,
                'description'=>$json->description

            ));

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($connectionId, "connection")
            ));

           return array_merge(array('id'=>$connectionId));



    }


    protected function saveEvent($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateEvent($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));

            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "event")
            ));

           return array('id'=>$json->id);

        }



            $eventId=$this->getPlugin()->getDatabase()->createEvent($fields=array(

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

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($eventId, "event")
            ));

           return array_merge(array('id'=>$eventId));



    }

    protected function saveRequest($json){

        if($json->id>0){

            $this->getPlugin()->getDatabase()->updateRequest($fields=array(
                'id'=>$json->id,
                'name'=>$json->name,
                'description'=>$json->description,
                'modifiedDate'=>date('Y-m-d H:i:s')
            ));

            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "request")
            ));

           return array('id'=>$json->id);

        }



            $requestId=$this->getPlugin()->getDatabase()->createRequest($fields=array(

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

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($requestId, "request")
            ));

           return array_merge(array('id'=>$requestId));



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
               $profileRecord=$this->getPlugin()->getDatabase()->getProfile($json->id)[0];
               if(!boolval($profileRecord->published)){
                    $fields['published']=true;
                    $fields['publishedDate']=$now;
               }
            }


            $this->getPlugin()->getDatabase()->updateProfile($fields);


            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "profile")
            ));


           return array('id'=>$json->id);

        }



            $profileId=$this->getPlugin()->getDatabase()->createProfile($fields=array(

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

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($profileId, "profile")
            ));

           return array_merge(array('id'=>$profileId));



    }


    protected function deleteProject($json){

        $item=$this->getPlugin()->getFeedItemRecord($json->id, "project");

        if($this->getPlugin()->getDatabase()->deleteProject($json->id)){

            Broadcast('eventlist', 'update', array(
                'event'=>'deleted',
                'item'=>$item
            ));
            return true;

        }

        return false;
    }
    protected function deleteConnection($json){

        $item=$this->getPlugin()->getFeedItemRecord($json->id, "connection");

        if($this->getPlugin()->getDatabase()->deleteConnection($json->id)){

            Broadcast('eventlist', 'update', array(
                'event'=>'deleted',
                'item'=>$item
            ));
            return true;

        }

        return false;
        
    }
    protected function deleteRequest($json){

        $item=$this->getPlugin()->getFeedItemRecord($json->id, "request");

        if($this->getPlugin()->getDatabase()->deleteRequest($json->id)){

            Broadcast('eventlist', 'update', array(
                'event'=>'deleted',
                'item'=>$item
            ));
            return true;

        }

        return false;
        
    }
    protected function deleteEvent($json){

         $item=$this->getPlugin()->getFeedItemRecord($json->id, "event");

        if($this->getPlugin()->getDatabase()->deleteEvent($json->id)){

            Broadcast('eventlist', 'update', array(
                'event'=>'deleted',
                'item'=>$item
            ));
            return true;

        }

        return false;
        
    }
    protected function deleteProfile($json){

         $item=$this->getPlugin()->getFeedItemRecord($json->id, "profile");

        if($this->getPlugin()->getDatabase()->deleteProfile($json->id)){

            Broadcast('eventlist', 'update', array(
                'event'=>'deleted',
                'item'=>$item
            ));
            return true;

        }

        return false;
        
    }



    protected function pinItem($json){

        $this->getPlugin()->getDatabase()->createUserPin(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }

    protected function unpinItem($json){

       $this->getPlugin()->getDatabase()->deleteUserPin(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }


    protected function archiveItem($json){

        $this->getPlugin()->getDatabase()->createUserArchiveItem(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }

    protected function unarchiveItem($json){

        $this->getPlugin()->getDatabase()->deleteUserArchiveItem(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return array;
            
    }


}
