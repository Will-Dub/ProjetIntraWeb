const card_list = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
const card_type_list = ["clubs", "diamonds", "hearts", "spades"];
let user_cards = [];
let user_cards_type = [];
let casino_cards = [];
let casino_cards_type = [];

let argent_miser = 0;
let game_number = 0;
let assurance_utiliser = false;

$(document).ready(function() {
    // Store table element
    const $show_table_btn = $('#show_table_btn');
    const $history_table = $('#history_table');

    // Verifie que l'utilisateur est connecté
    if($.cookie('solde') === undefined || $.cookie('email') === undefined){
        window.location.replace("index.html");
    }

    // Ouvre le formulaire pour parier
    //$('#betModal').modal('show');

    // Enleve les erreurs
    resetErreur();

    refreshSolde();

    // Rend le boutton pour jouer visible
    $("#btn-play").removeClass("d-none");

    //Quand le formulaire est soumit
    $('#betForm').submit(function(event) {
        event.preventDefault();
        resetErreur();

        // Verifie que l'utilisateur à l'argent
        argent_miser = parseFloat($("#bet_amount").val());
        console.log(argent_miser);
        let solde = parseFloat($.cookie("solde"));
        if (argent_miser > solde){
            argent_miser = 0;
            $("#bet_invalide").removeClass("d-none");
            return;
        }
        $.cookie("solde", solde-argent_miser, { path: '/' });

        //Refresh le solde
        refreshSolde();

        // Met a jour la mise sur l'écran
        $("#bet_amount_indicator").text(`Votre mise: ${argent_miser.toFixed(2)}$`);

        // Rend le boutton pour jouer invisible
        $("#btn-play").addClass("d-none");

        // Enleve le formulaire
        $('#betModal').modal("hide");

        // Commence le jeux
        start_play();
    });

    //Montre l'historique des jeux
    $show_table_btn.click( function(){
        $history_table.toggleClass("d-none");
        if ($history_table.hasClass("d-none")) {
            $show_table_btn.text("Montrer l'historique");
        } else {
            $show_table_btn.text("Cacher l'historique");
        }
    })
})

function start_play(){
    //Ajoute à l'historique des jeux
    assurance_utiliser = false;
    game_number += 1;
    $("#tbody_history").append("<tr><td>" + game_number + "</td><td>" + argent_miser.toFixed(2) +"$</td><td>En cours</td></tr>");

    // Rend toutes cartes invisibles
    $('#casino_cards img').addClass("d-none");
    $('#user_cards img').addClass("d-none");

    //Draw les cartes de base
    drawCardCasino();
    drawCardCasino();
    drawCardUser();
    drawCardUser();

    casino_cards[0] = 0;

    refreshCards();
    getCount(user_cards);
    refresh_user_buttons();
}

function hit(){
    //Pige une carte
    drawCardUser();

    // Verifie le compte
    const new_user_count = getCount(user_cards);
    if (new_user_count > 21){
        // Perdu
        $(".btn-user").addClass("d-none");
        refreshCards(true);
        show_message("Vous avez perdu");
        $("#tbody_history tr:last").html("<td>" + game_number + "</td><td>" + argent_miser.toFixed(2) +"$</td><td>Perdu</td>");
        game_end();
        return;
    }
    else if(new_user_count === 21){
        stand();
        return;
    }

    refresh_user_buttons();
    refreshCards();
}

function stand(){
    // Rend les boutons invisible
    $(".btn-user").addClass("d-none");

    // Compte les points
    const final_user_count = getCount(user_cards);
    let casino_count = getCount(casino_cards);

    // Le casino pige sous et sur 16
    while(casino_count <= 16) {
        // Pige une carte
        drawCardCasino();
        casino_count = getCount(casino_cards);
    }

    // Montre toute les cartes
    refreshCards(true);

    // Refresh le compte du casino
    casino_count = getCount(casino_cards);

    // Regarde qui a gagné
    if(casino_count > 21 || casino_count < final_user_count){
        // Win
        const argent_gagner = (Math.round(argent_miser*1.5 * 100) / 100).toFixed(2);
        show_message(`Vous avez gagné ${argent_gagner}$`);
        $.cookie("solde", parseFloat($.cookie("solde"))+parseFloat(argent_gagner), { path: '/' });
        $("#tbody_history tr:last").html("<td>" + game_number + "</td><td>" + argent_miser.toFixed(2) +"$</td><td>Gagné</td>");
    } else if(casino_count === final_user_count){
        // Push
        $.cookie("solde", parseFloat($.cookie("solde"))+argent_miser, { path: '/' });
        show_message("Égalité");
        $("#tbody_history tr:last").html("<td>" + game_number + "</td><td>" + argent_miser.toFixed(2) +"$</td><td>Égalité</td>");
    } else{
        // Lose
        show_message("Vous avez perdu");
        $("#tbody_history tr:last").html("<td>" + game_number + "</td><td>" + argent_miser.toFixed(2) +"$</td><td>Perdu</td>");
    }

    game_end();

}

function insurance(){
    // Calcul l'argent miser
    const argent_miser_insurance = parseFloat((Math.round(argent_miser / 2 * 100) / 100).toFixed(2));

    assurance_utiliser = true;

    // Verifie que le casino a un compte de 21 et que la premiere carte est un as
    if(getCount(casino_cards) === 21 && casino_cards[0] === 0){
        //L'assurance est gagné
        show_message(`Vous avez gagnez l'assurance. La partie termine`);

        //Redonne l'argent misé
        $.cookie("solde", parseFloat($.cookie("solde"))+argent_miser, { path: '/' });

        $("#tbody_history tr:last").html("<td>" + game_number + "</td><td>" + argent_miser.toFixed(2) +"$</td><td>Assurance gagné</td>");

        refreshCards(true);
        game_end();
    }else{
        // L'assurance est perdu
        show_message(`Vous avez perdu l'assurance, le casino n'a pas un blackjack(${argent_miser_insurance}$). La partie continue`);

        $.cookie("solde", parseFloat($.cookie("solde"))-argent_miser_insurance, { path: '/' });

        $("#tbody_history tr:last").before("<tr><td>Assurance</td><td>" + argent_miser_insurance.toFixed(2) +"$</td><td>Perdu</td></tr>");
        refresh_user_buttons();
    }
    refreshSolde();

}

function refresh_user_buttons(){
    $("#btn-hit").removeClass("d-none");
    $("#btn-stand").removeClass("d-none");

    // La carte du casino est un as, l'assurance n'a pas ete utilisee et l'utilisateur l'argent
    if (casino_cards[0] === 0 && assurance_utiliser === false && (parseFloat($.cookie("solde")) > (argent_miser / 2))){
        $("#btn-insurance").removeClass("d-none");
    }
    else{
        $("#btn-insurance").addClass("d-none");
    }
}

function getCount(list){
    let list_count = 0;
    let ace_count = 0;
    for(let i =0; i<list.length; i++){
        switch (list[i]){
            case 0:
                ace_count+=1;
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                list_count += (list[i] + 1);
                break;
            case 10:
            case 11:
            case 12:
                list_count += 10;
                break;
            default:
                break;
        }
    }

    for (let i = 0; i<ace_count; i++){
        if ((list_count + 11) > 21){
            list_count += 1;
        }else{
            list_count += 11;
        }
    }
    return list_count;
}

function drawCardUser(){
    user_cards.push(getRandomInt(13));
    user_cards_type.push(getRandomInt(4));
}

function drawCardCasino(){
    casino_cards.push(getRandomInt(13));
    casino_cards_type.push(getRandomInt(4));
}

function refreshCards(showall = false){
    for(let i =0; i<user_cards.length; i++){
        $("#user-card"+i).removeClass("d-none");
        $("#user-card"+i).attr("src",`images/Cards/${card_list[user_cards[i]]}_of_${card_type_list[user_cards_type[i]]}.png`);
    }

    if(showall === false){
        $("#casino-card0").removeClass("d-none");
        $("#casino-card1").removeClass("d-none");
        $("#casino-card0").attr("src",`images/Cards/${card_list[casino_cards[0]]}_of_${card_type_list[casino_cards_type[0]]}.png`);
        $("#casino-card1").attr("src",`images/Cards/card_of_upsidedown.png`);
    }else{
        for(let i =0; i<casino_cards.length; i++){
            $("#casino-card"+i).removeClass("d-none");
            $("#casino-card"+i).attr("src",`images/Cards/${card_list[casino_cards[i]]}_of_${card_type_list[casino_cards_type[i]]}.png`);
        }
    }
}

function game_end(){
    // Rend tous les bouton de jeux invisibles
    $(".btn-user").addClass("d-none");

    // Rend le boutton pour jouer visible
    $("#btn-play").removeClass("d-none");

    user_cards = [];
    user_cards_type = [];
    casino_cards = [];
    casino_cards_type = [];
    refreshSolde();

    // Retourne a index.html si l'utilisateur n'a plus d'argent
    if (parseFloat($.cookie("solde")) === 0){
        setTimeout(function() {
            window.location.href = "index.html";
        }, 5000);
    }
}

function resetErreur(){
    $(".erreur").addClass("d-none");
}

function show_message(message){
    $('#resultModal').modal("show");
    $('#resultModalLabel').text(message);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
