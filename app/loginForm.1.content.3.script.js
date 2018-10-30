return new ElementModule('a', {
    "html":"Register",
    events:{click:function(e){
        e.stop();
        wizard.displayNext();
    }}
});