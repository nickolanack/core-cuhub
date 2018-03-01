<?php

class ProjectHubDatabase extends core\DataStorage {

    use core\DatabaseTrait;

    /**
     * Magic methods.
     *
     * getX($id)
     * createX($fields)
     * updateX($fields|(with id))
     * deleteX($id)
     * getXs($filters)|getAllXs($filters);
     */


    /*
     * Special queries
     */    
    


    public function deleteUserPin($uid, $itemType, $itemId) {
        return $this->deleteEntry('watch', array(
            'uid'=>$uid,
            'itemId' => $itemId,
            'itemType' => $itemType,
            'watchType'=>'pin'
        ));
    }

    public function createUserPin($uid, $itemType, $itemId) {
        return $this->createWatch(array(
            'uid'=>$uid,
            'itemId' => $itemId,
            'itemType' => $itemType,
            'watchType'=>'pin'
        ));
    }




    public function deleteUserArchiveItem($uid, $itemType, $itemId) {
        return $this->deleteEntry('ignore', array(
            'uid'=>$uid,
            'itemId' => $itemId,
            'itemType' => $itemType,
            'ignoreType'=>'archive'
        ));
    }

    public function createUserArchiveItem($uid, $itemType, $itemId) {
        return $this->createIgnore(array(
            'uid'=>$uid,
            'itemId' => $itemId,
            'itemType' => $itemType,
            'ignoreType'=>'archive'
        ));
    }

 
}
