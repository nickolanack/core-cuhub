IncludeJSBlock('


TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');


');

/**
 * Add all views that wont be autoloaded. (any view that is rendered programatically and not by default) 
 */

GetPlugin('ProjectHub')->includeScripts();

GetWidget('cuhubStyle')->display($targetInstance);
//if(UrlVar('tpl',false)){
    GetWidget('cuhubDebugStyle')->display($targetInstance);
//}
GetWidget('emptyListView')->display($targetInstance);
GetWidget('cuhubGeneratedStyle')->display($targetInstance);