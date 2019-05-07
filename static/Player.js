// ===== Player ===== //

function Player(id) {
    this.hand = new Array();
    this.playerSlot = document.getElementById(id);
    this.cardsText = document.getElementById(id + "Cards");
    this.scoreText = document.getElementById(id + "Score");
    this.betText = document.getElementById(id + "Bet");
    this.credits = 0;
    this.bet = 0;
    //need a "split" boolean?
    this.reset = resetPlayer;
    this.addCard = addCard;
    this.removeCard = rmCard;
    this.getScore = getScore;
    this.clearHand = clearHand;
    // Empty hand
    this.reset();
}

function resetPlayer() {
    this.clearHand();
    this.blackjack = false;
    this.split = false;
    this.doubled = false;
    this.card = new Array();
}

function showPlayerInfo(numb) {
    console.log("updating player info");
    p = players[numb];
    p.cardsText.innerHTML = AnimateCard(p.hand, false);
    p.scoreText.innerText = p.getScore();
    p.betText.innerHTML = players[numb].bet;
}