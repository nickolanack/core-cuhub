var ul=new ElementModule('ul');

ul.appendChild(new Element('li',{
    html:"One",
    events:{click:function(){
        
    }}
}));

return ul;