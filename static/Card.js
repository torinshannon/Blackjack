// ===== Card ===== //

function Card(value, suit, face) {
    this.val = value;
    this.suit = suit;
    this.face = face;
}

function pullCard() {
    var card = new Card;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var t = JSON.parse(this.responseText);
            card.val = t.value;
            card.suit = t.suit;
            card.face = t.face;
        }
    };
    req.open("GET", "/getCard", false);
    req.send();
    document.getElementById("dealerscore").innerHTML = "--";
    //console.log("cards: " + card.val + ", Suit #: " + card.suit + ", Face:" + card.face);
    return card;
}

function AnimateCard(hand, down) {
    var i;
    var start = 0;
    var lines = ["", "", "", "", ""];
    if (down) {
        lines = [".---.", "|///|", "|///|", "|///|", "'---'"];
        start = 1;
    }
    for (i = start; i < hand.length; i++) {
        lines[0] += ".---.";
    }
    lines[0] += "</br>";
    for (i = start; i < hand.length; i++) {
        lines[1] += "|" + hand[i].face;
        if (hand[i].face == "10") {
            lines[1] += "  |";
        } else {
            lines[1] += "&nbsp; |";
        }
    }
    lines[1] += "</br>";
    for (i = start; i < hand.length; i++) {
        lines[2] += "|  " + getSymbol(hand[i].suit) + "  |";
    }
    lines[2] += "</br>";
    for (i = start; i < hand.length; i++) {
        if (hand[i].face == "10") {
            lines[3] += "|  " + hand[i].face + "|";
        } else {
            lines[3] += "|  &nbsp;" + hand[i].face + "|";
        }
    }
    lines[3] += "</br>";
    for (i = start; i < hand.length; i++) {
        lines[4] += "'---'";
    }
    lines[4] += "</br>";
    return lines[0] + lines[1] + lines[2] + lines[3] + lines[4];
}

function getSymbol(num) {
    switch (num) {
        case 0:
            return "&#9828";
        case 1:
            return "&#9827";
        case 2:
            return "&#9829";
        case 3:
            return "&#9830;";
    }
}