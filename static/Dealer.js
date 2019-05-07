// ===== Dealer ===== //

function Dealer() {
    this.hand = new Array();
    this.getScore = getScore;
    this.addCard = addCard;
    this.reset = resetDealer;
    // Initialize as a empty hand;
    this.reset();
}

function resetDealer() {
    this.blackjack = false;
    this.hand = new Array();
}

function startDealer() {
    var i, allBusts;
    allBusts = true;
    console.log("dealers turn");
    for (i = 0; i < mxPlayers; i++)
        if (players[i].getScore() <= 21)
            allBusts = false;
    if (allBusts) {
        console.log("all players have busted")
        endRound();
        return;
    }
    playDealer()
}

function playDealer() {
    console.log("dealer plays");
    if (dealer.getScore() < 17) {
        dealToDealer();
        return;
    }
    if (dealer.getScore() > 21) {
        console.log("dealer busts");
        endRound();
        return;
    }
    document.getElementById("dealerscore").innerHTML = dealer.getScore();
    document.getElementById("dealercards").innerHTML = AnimateCard(dealer.hand, false);
    console.log("dealer stays");
    endRound();
    return;
}

function dealToDealer() {
    console.log("dealer hits");
    dealer.addCard(pullCard());
    playDealer();
}

