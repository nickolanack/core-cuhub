//return namedView


viewControllerApp.getNamedValue('navigationController', function(controller){
    var view=controller.getTemplateNameForView(controller.getCurrentView());
    callback(view);
});
