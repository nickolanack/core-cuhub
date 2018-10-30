return new ElementModule('a', {
    "html":"Register a new account",
    "style":"float: right; color: #2749f8; line-height: 25px;",
    events:{click:function(e){
        e.stop();
        wizard.displayNext();
    }}
});