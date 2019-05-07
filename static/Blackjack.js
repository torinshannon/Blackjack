var ctrPlayer, mxPlayers;
var maxSplits = 4;
var dealer, i;
var players = new Array(maxSplits + 1);
var dealRoundCounter;
// setup page
window.onload = initGame;

function initGame() {
    console.log("initializing game")
    hideActionButtons();
    dealer = new Dealer();
    for (var i = 0; i < players.length; i++) {
        players[i] = new Player("player" + i);
    }
}

// ====== bank handler ======= //
function getCash() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("playermoney").innerHTML = "Bank: $" + this.responseText;
            console.log("playermoney (get): " + this.responseText)
        }
    };
    req.open("GET", "/getCash", false);
    req.send();
}

function takeCash(amount) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("playermoney").innerHTML = "Bank: $" + this.responseText;
            console.log("playermoney after taking: " + this.responseText)
        }
    };
    console.log("amount to take: " + amount);
    req.open("GET", "/takeCash/" + amount, false);
    req.send();
}

function giveCash(amount) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("playermoney").innerHTML = "Bank: $" + this.responseText;
            console.log("playermoney after giving: " + this.responseText)
        }
    };
    console.log("amount to give: " + amount);
    req.open("GET", "/giveCash/" + amount, false);
    req.send();
}

// ==== Game Functions ====== //
function startRound(amount) {
    console.log("starting round");
    dealer.reset();
    for (i = 0; i < players.length; i++) {
        players[i].reset();
        if (i > 0) {
            players[i].playerSlot.style.display = "none";
        }
    }
    document.getElementById("message").innerHTML = "--";
    hideBetButtons();
    ctrPlayer = 0;
    mxPlayers = 1;
    players[ctrPlayer].credits = getCash();
    if (amount > players[ctrPlayer].credits) {
        document.getElementById("message").innerHTML = "Not enough money!";
        return true;
    }
    players[ctrPlayer].bet = amount;
    players[ctrPlayer].credits -= players[ctrPlayer].bet;
    players[ctrPlayer].betText.innerHTML = players[ctrPlayer].bet;
    takeCash(amount);
    dealRoundCounter = 1;
    dealRound();
}

function dealRound() {
    console.log("Dealing ....");
    switch (dealRoundCounter) {
        case 1:
            for (i = 0; i < mxPlayers; i++) {
                players[i].addCard(pullCard());
            }
            break;
        case 2:
            dealer.addCard(pullCard());
            break;
        case 3:
            for (i = 0; i < mxPlayers; i++) {
                players[i].addCard(pullCard());
            }
            break;
        case 4:
            dealer.addCard(pullCard());
            break;
        default:
            console.log("card draws done")
            document.getElementById("dealercards").innerHTML = AnimateCard(dealer.hand, true);
            showPlayerInfo(ctrPlayer);
            playRound();
            return;
    }
    if (players[ctrPlayer].getScore() == 21) {
        players[ctrPlayer].blackjack = true;
    }
    dealRoundCounter++;
    dealRound();
}

function playRound() {
    console.log("playing round")
    // enable/ disable buttons
    var scr;
    scr = players[ctrPlayer].getScore();
    document.getElementById("stbutton").style.display = "inline";
    document.getElementById("htbutton").style.display = "inline";
    if (scr = 9 || scr == 10 || scr == 11) {
        document.getElementById("ddbutton").style.display = "inline";
    }
    if (canSplit()) {
        document.getElementById("spbutton").style.display = "inline";
    }
    console.log("Player score: " + players[ctrPlayer].getScore());
    console.log("Dealer score: " + dealer.getScore());
    if (dealer.getScore() == 21) {
        dealer.blackjack = true;
    }
    if (players[ctrPlayer].blackjack || dealer.blackjack) {
        console.log("someone got blackjack, ending round")
        endRound();
        return;
    }
}

function endRound() {
    var i, d, p, tmp;
    d = dealer.getScore();
    console.log("ending round");
    for (i = 0; i < mxPlayers; i++) {
        p = players[i].getScore();
        tmp = players[i].bet;
        if ((players[i].blackjack && !dealer.blackjack) || (p <= 21 && d > 21) || (p <= 21 && p > d)) {
            console.log("player wins");
            tmp = 2 * players[i].bet;
            if (players[i].blackjack){
                tmp += players[i].bet / 2;
            }
            giveCash(Math.floor(tmp));
            document.getElementById("message").innerHTML = "YOU WIN! $" + tmp;
        } else if ((dealer.blackjack && !players[i].blackjack) || p > 21 || p < d) {
            console.log("Dealer wins");
            document.getElementById("message").innerHTML = "DEALER WIN! $" + tmp;
        } else {
            console.log("Push");
            giveCash(tmp);
            document.getElementById("message").innerHTML = "PUSH! $" + tmp;
        }
    }
    showBetButtons();
    hideActionButtons();
}

function canSplit() {
    var n;
    if (mxPlayers > maxSplits)
        return false;
    n = ctrPlayer;
    if (players[n].hand[0].val == players[n].hand[1].val) {
        return true;
    }
    return false;
}

function startNextHand() {
    console.log("next hand...");
    ctrPlayer++;
    if (ctrPlayer >= mxPlayers) {
        startDealer();
        return;
    } else {
        if (players[ctrPlayer].split)
            showPlayerInfo(ctrPlayer);
            playerHit();

    }
}

function showBetButtons() {
    document.getElementById("d2button").style.display = "inline";
    document.getElementById("d5button").style.display = "inline";
    document.getElementById("d10button").style.display = "inline";
    document.getElementById("d20button").style.display = "inline";
}

function hideBetButtons(){
    document.getElementById("d2button").style.display = "none";
    document.getElementById("d5button").style.display = "none";
    document.getElementById("d10button").style.display = "none";
    document.getElementById("d20button").style.display = "none";
}

function showActionButtons(){
    document.getElementById("ddbutton").style.display = "inline";
    document.getElementById("stbutton").style.display = "inline";
    document.getElementById("htbutton").style.display = "inline";
    document.getElementById("spbutton").style.display = "inline";
}

function hideActionButtons(){
    document.getElementById("ddbutton").style.display = "none";
    document.getElementById("stbutton").style.display = "none";
    document.getElementById("htbutton").style.display = "none";
    document.getElementById("spbutton").style.display = "none";
}
