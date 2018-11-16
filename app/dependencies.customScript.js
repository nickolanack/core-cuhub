GetWidget('cuhubStyle')->display($targetInstance);
GetWidget('calendarStyle')->display($targetInstance);


GetWidget('stickyRightPanelStyle')->display($targetInstance);

GetWidget('cuhubResponsiveStyle')->display($targetInstance);


GetWidget('emptyListView')->display($targetInstance);
GetWidget('emptyPinnedListView')->display($targetInstance);
GetWidget('cuhubGeneratedStyle')->display($targetInstance);

(new core\WidgetLoader())->displayWidgets(array(
    
    'guestExpandedDetail',
    'profileExpandedDetail',
    'loginForm',
    'forgotPasswordForm',
    'eventForm',
    'projectForm',
    'connectionForm',
    'connectWithUserForm',
    'connectWithEventForm'
    
), $targetInstance);



GetWidget('requestForm')->display($targetInstance);

GetWidget('profileForm')->display($targetInstance);
GetWidget('dialogForm')->display($targetInstance);

GetWidget('defaultPostDetail')->display($targetInstance);


GetWidget('mainPinnedDetail')->display($targetInstance);
GetWidget('mainSingleDetail')->display($targetInstance);
GetWidget('mainArchiveDetail')->display($targetInstance);

GetWidget('mainContactDetail')->display($targetInstance);
GetWidget('mainAboutDetail')->display($targetInstance);
GetWidget('mainCalendarDetail')->display($targetInstance);

GetWidget('contactForm')->display($targetInstance);
GetWidget('directChatForm')->display($targetInstance);

GetWidget('createItemsMenuForm')->display($targetInstance);


GetWidget('eventFeedSearchItemDetail')->display($targetInstance);


        $apikey=GetPlugin('Maps')->getParameter('googleMapsServerApiKey', '');
        if(!empty($apikey)){
            $apikey='&key='.$apikey;
        }
        
        $version=GetPlugin('Maps')->getParameter('googleMapsVersion', '');
        if(!empty($version)){
            $version='&v='.$version;
        }

        IncludeExternalJS(
            '//maps.google.com/maps/api/js?libraries=places'.$apikey.$version
        );