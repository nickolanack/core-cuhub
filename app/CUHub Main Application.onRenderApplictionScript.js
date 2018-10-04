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
Behavior('ajax');
		Behavior('spinner');
		IncludeJS('{scripts}/Controls/UIControl.js');
		IncludeJS('{scripts}/Controls/UIButton.js');
		IncludeJS('{plugins}/Attributes/js/AttributeFilter.js');
		IncludeJS('{plugins}/Attributes/js/AttributeQueries.js');
		Behavior('aggregator');
		IncludeJS('{plugins}/Maps/js/GeoliveSearchAggregators.js');
		IncludeJS('{plugins}/Attributes/js/AttributeAggregators.js');
		IncludeJS('{plugins}/Attributes/Widgets/AttributesSearch/js/DropDownMenu.js');
		//IncludeCSS('{plugins}/Attributes/Widgets/AttributesSearch/css/AttributesSearch.css');
		IncludeJS('{scripts}/Controls/UISearchControl.js');

		IncludeJS('{modules}/Search/js/SearchModule.js');

IncludeJSBlock('

    window.FeedItemListResponse='.json_encode($feedItemList=$projectHub->listFeedItemsAjax()).';

');


$projectHub->printFeedItemLinksHtml();



(new \core\AsyncDisplay())->display(function()use($targetInstance){

GetWidget('dependencies')->display($targetInstance);

});