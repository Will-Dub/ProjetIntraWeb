$(document).ready(function() {
    if($.cookie('solde') === undefined || $.cookie('email') === undefined){
        window.location.replace("index.html");
    }

    refreshSolde();
})