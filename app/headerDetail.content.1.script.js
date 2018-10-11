var ul=new ElementModule('ul');

var addView=function(view){
    ul.appendChild(new Element('li',{
        html:view,
        events:{click:function(){
            application.getNamedValue('navigationController').navigateTo(view, "Main");
        }}
    }));
}
var events=["Events", "Projects", "Connections", "Profiles"];
events.forEach(addView);

return ul;