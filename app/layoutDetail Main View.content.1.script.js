var mod= new ElementModule("div",{"class":"intro-text"})
var p=new Element('p',{
    html:"Welcome to CUHub ... and description of current page"
});
mod.appendChild(p)

application.getNamedValue('navigationController',function(nav){
    nav.addEvent('navigate', function(state){
        p.innerHTML=JSON.stringify(state);
    });
})

return mod;