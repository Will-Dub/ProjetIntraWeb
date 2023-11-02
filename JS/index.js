$(document).ready(function() {
    resetErreur();
    refreshSolde();

    if($.cookie('solde') === undefined || $.cookie('email') === undefined){
        $('#signupModal').modal('show');
    }
    else {
        refreshSolde();
    }

    $('#signupForm').submit(function(event) {
        event.preventDefault();

        resetErreur();

        const email = $("#email").val();
        const password = $("#password").val();
        const cc = $("#cc").val();
        let ed = $("#ed").val();
        const cvv = $("#cvv").val();
        let solde = $("#payment").val();

        // Verifie la date d'expiration de la carte
        ed = ed.split("/");
        const ed_year = parseInt(ed[1]);
        const ed_month = parseInt(ed[0]);
        const date = new Date();
        const current_year = parseInt(date.getFullYear().toString().substr(-2));
        const current_month = date.getMonth() + 1;
        if(ed_year <= current_year){
            if(ed_year < current_year){
                // Invalide
                console.log("ED year too low");
                $("#cc-invalide").removeClass("d-none");
                return;
            }
            if(ed_month < current_month){
                // Invalide
                console.log("ED month too low");
                $("#cc-invalide").removeClass("d-none");
                return;
            }
        }

        // Met la connexion dans la mémoire
        $.cookie("email", email);
        $.cookie("solde", solde);

        //Refresh le solde
        refreshSolde();
        $('#signupModal').modal("hide");
    });

});

function resetErreur(){
    $(".erreur").addClass("d-none");
}
