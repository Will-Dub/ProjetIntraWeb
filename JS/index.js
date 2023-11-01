$(document).ready(function() {
    resetErreur();

    if($.cookie('solde1') === undefined){
        $('#signupModal').modal('show');
        $.cookie('solde', 0);
    }
    else {
        $('#soldeLabel').text("Votre solde: " + (Math.round($.cookie('solde') * 100) / 100).toFixed(2) + "$");
    }

    $('#signupForm').submit(function(event) {
        resetErreur();
        event.preventDefault();
        const email = $("#email").val();
        const password = $("#password").val();
        const cc = $("#cc").val();
        let ed = $("#ed").val();
        const cvv = $("#cvv").val();
        let solde = $("#payment").val();

        ed = ed.split("/");
        const ed_year = parseInt(ed[1]);
        const ed_month = parseInt(ed[0]);
        const date = new Date()
        const current_year = parseInt(date.getFullYear().toString().substr(-2));
        const current_month = date.getMonth() +1;
        if(ed_year <= current_year){
            if(ed_year < current_year){
                console.log("ED year too low");
                $("#cc-invalide").removeClass("d-none");
                return;
            }
            if(ed_month < current_month){
                console.log("ED month too low");
                $("#cc-invalide").removeClass("d-none");
                return;
            }
        }
        console.log("Valid form");
        $.cookie("email", email);
        $.cookie("solde", solde);
    });

});

function resetErreur(){
    $(".erreur").addClass("d-none");
}
