function refreshSolde(){
    let solde = $.cookie('solde');
    if ($.cookie('solde') === undefined || solde < 0){solde = 0}
    $('#soldeLabel').text("Votre solde: " + (Math.round(solde * 100) / 100).toFixed(2) + "$");
}