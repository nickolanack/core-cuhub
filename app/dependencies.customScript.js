(new core\WidgetLoader())->displayWidgets(array(
    'cuhubStyle',
    'calendarStyle',
    'stickyRightPanelStyle',
    'cuhubResponsiveStyle',
    'emptyListView',
    'emptyPinnedListView',
    'cuhubGeneratedStyle',
    'guestExpandedDetail',
    'profileExpandedDetail',
    'loginForm',
    'forgotPasswordForm',
    'eventForm',
    'projectForm',
    'connectionForm',
    'connectWithUserForm',
    'connectWithEventForm',
    'requestForm',
    'profileForm',
    'dialogForm',
    'defaultPostDetail',
    'mainPinnedDetail',
    'mainSingleDetail',
    'mainArchiveDetail',
    'mainContactDetail',
    'mainAboutDetail',
    'mainCalendarDetail',
    'contactForm',
    'directChatForm',
    'createItemsMenuForm',
    'eventFeedSearchItemDetail'
    
), $targetInstance);



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