// ===== Hand ===== //
function addCard(card) {
    var n;
    n = this.hand.length;
    this.hand[n] = card;
}

function rmCard() {
    var card;
    card = null;
    if (this.hand.length > 0) {
        card = this.hand.pop();
    }
    console.log("current player: " + this.hand.length);
    return card;
}

function clearHand() {
    return this.hand.length = 0;
}

function playerHit() {
    console.log("Player Hit...");
    var n, p;
    n = ctrPlayer;
    players[n].addCard(pullCard());
    p = players[n].getScore();
    if (p > 21) {
        showPlayerInfo(n);
        startNextHand();
        return;
    }
    if (p == 21 || players[n].doubled) {
        showPlayerInfo(n);
        startNextHand();
        return;
    }
    showPlayerInfo(n);
    console.log("player score: " + players[ctrPlayer].getScore());
    console.log("Dealer score: " + dealer.getScore());
}

function playerStand() {
    console.log("standing");
    startNextHand();
}

function playerSplit() {
    var m, n;
    var card;
    document.getElementById("spbutton").style.display = "none";
    m = ctrPlayer;
    n = mxPlayers;
    mxPlayers++;
    players[m].split = true;
    players[n].split = true;
    card = players[m].removeCard();
    players[n].addCard(card);
    players[n].playerSlot.style.display = "";
    players[n].bet = players[m].bet;
    takeCash(players[n].bet);
    console.log("Player splitting...");
    playerHit();
}

function playerDouble() {
    var tmp;
    console.log("Player doubling...");
    if (players[ctrPlayer].credits < players[ctrPlayer].bet) {
        document.getElementById("message").innerHTML = "Not enough money to double down!";
        return true;
    }
    tmp = players[ctrPlayer].bet;
    players[ctrPlayer].bet = (2 * tmp);
    takeCash(tmp);
    players[ctrPlayer].doubled = true;
    playerHit();
}

function getScore() {
    var i, total;
    total = 0;
    for (i = 0; i < this.hand.length; i++)
        if (this.hand[i].val == 1)
            total++;
        else {
            if (this.hand[i].face === "J" || this.hand[i].face === "Q" ||
                this.hand[i].face === "K")
                total += 10;
            else
                total += parseInt(this.hand[i].face, 10);
        }
    // Change as many ace values to 11 as possible.
    for (i = 0; i < this.hand.length; i++)
        if (this.hand[i].val == 1 && total <= 11)
            total += 10;
    return total;
}