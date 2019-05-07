from app import db, Room, User, Profile, Deck, Card
from random import shuffle

db.create_all()

testuser = User(username='testuser', password='1234', isActive=False, gameState=0)
testprof = Profile(firstname='John', lastname='Doe', email='test@test.com', cash=200)
testuser.profile_id = testprof.id
db.session.add(testuser)
db.session.add(testprof)

testroom = Room(usercount=0)
db.session.add(testroom)

deck = Deck(cardcount=0, room_id=testroom.id)
db.session.add(deck)
db.session.commit()

faces = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
suits = [0, 1, 2, 3]
# suits = ["&", "^", "@", "%"]        # ascii-safe

cardlist = []
for i in range(4):
    for face in faces:
        for suit in suits:
            if face in ("J", "Q", "K"):
                card = Card(suit=suit, face=face, value=10)
            elif face == "A":
                card = Card(suit=suit, face=face, value=1)
            else:
                card = Card(suit=suit, face=face, value=int(face))
            cardlist.append(card)

shuffle(cardlist)

for card in cardlist:
    c = Card(suit=card.suit, face=card.face, value=card.value, dealt=False)
    c.deck_id = deck.id
    d = Deck.query.filter_by(id=c.deck_id).first()
    d.cardcount = d.cardcount + 1
    db.session.add(c)

db.session.commit()
