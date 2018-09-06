<?php

class ProjectHubAjaxController extends core\AjaxController implements core\PluginMember
{
    use core\PluginMemberTrait;



    protected function search($json){

        $results=$this->getPlugin()->searchFeedItems($json->search);

        return array('results'=>$results);

    }


    protected function listFeedItems($task, $json)
    {

        return $this->getPlugin()->listFeedItemsAjax();

        

    }

    protected function usersProfile($task, $json)
    {

     
        
        $response=array('result'=>$this->getPlugin()->usersProfileItem(GetClient()->getUserId()));




        
        return $response;

    }

    protected function listPinnedFeedItems($task, $json)
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

    protected function listArchivedFeedItems($task, $json)
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


            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($id, "project")
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


            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "connection")
            ));

           return array('id'=>$json->id);

        }


      


            $id=$this->getPlugin()->getDatabase()->createConnection($fields=array(

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
                'item'=>$this->getPlugin()->getFeedItemRecord($id, "connection")
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

            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "event")
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

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($id, "event")
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

            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "request")
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

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($id, "request")
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


            Broadcast('eventlist', 'update', array(
                'event'=>'updated',
                'item'=>$this->getPlugin()->getFeedItemRecord($json->id, "profile")
            ));


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

            Broadcast('eventlist', 'update', array(
                'event'=>'created',
                'item'=>$this->getPlugin()->getFeedItemRecord($id, "profile")
            ));

           return array_merge(array('id'=>$id));



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

        $id=$this->getPlugin()->getDatabase()->deleteUserArchiveItem(
            GetClient()->getUserId(),
            $json->itemType,
            $json->itemId
        );

        return true;
            
    }


}
