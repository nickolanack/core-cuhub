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


$ui=GetWidget('interfaceConfig');
$labels=array_filter($ui->getConfigurationValues(),function($v,$k){ return strpos($k, 'label-')===0;}, ARRAY_FILTER_USE_BOTH);



IncludeJSBlock('

    //window.FeedItemListResponse='.json_encode($feedItemList=$projectHub->listFeedItemsAjaxCache()).';

    

    CuhubDashboard.setLabels('.json_encode($labels,JSON_PRETTY_PRINT).');


');


$projectHub->printFeedItemLinksHtml();

Behavior('aggregator');

//(new \core\AsyncDisplay())->display(function()use($targetInstance){

GetWidget('dependencies')->display($targetInstance);

//});