return new ElementModule('button', {
    "html":"Register a new account",
    "style":"float: right; color: #00d200; color black;",
    "class":"btn forgot-pwd WizardButton"
    events:{click:function(e){
        e.stop();
        wizard.displayStep(1);
    }}
});



