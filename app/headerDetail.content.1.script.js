var ul=new ElementModule('ul');

var addView=function(view){
    ul.appendChild(new Element('li',{
        html:view,
        events:{click:function(){
            
        }}
    }));
}

(["Events", "Projects", "Connections", "Profiles"]).forEach(function(v){
    addView(v);
})

return ul;