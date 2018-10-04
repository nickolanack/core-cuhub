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
Behavior('aggregator');

IncludeJSBlock('

    window.FeedItemListResponse='.json_encode($feedItemList=$projectHub->listFeedItemsAjax()).';

');


$projectHub->printFeedItemLinksHtml();



(new \core\AsyncDisplay())->display(function()use($targetInstance){

GetWidget('dependencies')->display($targetInstance);

});