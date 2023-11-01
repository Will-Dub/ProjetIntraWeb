$(document).ready(function() {
    if($.cookie('email') === undefined){
        $('#signupModal').modal('show');
        //$.cookie('email', 'ee');
    }
});

$("form").submit(function (){
    alert("aaa");
    event.preventDefault();
})