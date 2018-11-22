var mod= new ElementModule("div",{"class":"intro-text"})
var p=new Element('p',{
    html:"Welcome to CUHub ... and description of current page"
});
mod.appendChild(p)

application.getNamedValue('navigationController',function(nav){
    nav.addEvent('navigate', function(state){
       EventList.SetPageDescription(p, state);
    });
    EventList.SetPageDescription(p, nav.getCurrentView());
});

return mod;