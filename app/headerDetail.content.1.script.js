var ul=new ElementModule('ul');

var addView=function(view){
    ul.appendChild(new Element('li',{
        html:view,
        events:{click:function(){
            application.getNamedValue('navigationController').navigateTo(view, "Main");
        }}
    }));
}

(["Events", "Projects", "Connections", "Profiles"]).forEach(function(v){
    addView(v);
});

return ul;