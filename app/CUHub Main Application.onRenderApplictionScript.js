HtmlDocument()->META(HtmlDocument()->website(), 'base');


IncludeJSBlock('


TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');


');

/**
 * Add all views that wont be autoloaded. (any view that is rendered programatically and not by default) 
 */

$projectHub=GetPlugin('ProjectHub');

$projectHub->setDocumentMetadata();

$projectHub->includeScripts();

IncludeJSBlock('

    window.FeedItemListResponse='.json_encode($feedItemList=$projectHub->listFeedItemsAjax()).';

');


$projectHub->printFeedItemLinksHtml();



GetWidget('cuhubStyle')->display($targetInstance);
GetWidget('calendarStyle')->display($targetInstance);
if(UrlVar('tpl',false)){
    GetWidget('cuhubDebugStyle')->display($targetInstance);
}

GetWidget('stickyRightPanelStyle')->display($targetInstance);

GetWidget('cuhubResponsiveStyle')->display($targetInstance);


GetWidget('emptyListView')->display($targetInstance);
GetWidget('emptyPinnedListView')->display($targetInstance);
GetWidget('cuhubGeneratedStyle')->display($targetInstance);


GetWidget('guestExpandedDetail')->display($targetInstance);
GetWidget('profileExpandedDetail')->display($targetInstance);
GetWidget('loginForm')->display($targetInstance);

GetWidget('eventForm')->display($targetInstance);
GetWidget('projectForm')->display($targetInstance);
GetWidget('connectionForm')->display($targetInstance);
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