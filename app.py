from flask import Flask, request, render_template, redirect, flash, json, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_bootstrap import Bootstrap
import random

app = Flask(__name__, static_url_path='/static')
db = SQLAlchemy(app)
Bootstrap(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'nicekeymydude1337'

login_manager = LoginManager(app)
login_manager.init_app(app)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(40), nullable=False)
    isActive = db.Column(db.Boolean, nullable=False)
    gameState = db.Column(db.Integer, nullable=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profile.id'), nullable=True)


class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(64), nullable=False)
    lastname = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(64), nullable=False)
    cash = db.Column(db.Integer)


class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    suit = db.Column(db.Integer, nullable=False)
    face = db.Column(db.String(16), nullable=False)
    value = db.Column(db.Integer)
    dealt = db.Column(db.Boolean)
    deck_id = db.Column(db.Integer, db.ForeignKey('deck.id'))

    def __repr__(self):
        return '{} of {} dealt status: {}'.format(self.face, self.suit, self.dealt)


class Deck(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cardcount = db.Column(db.Integer, nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))
    cards = db.relationship('Card', backref='deck')

    def __repr__(self):
        cards = Card.query.filter_by(deck_id=self.id).all()
        return 'Deck {} with {} cards {}'.format(self.id, self.cardcount, cards)



class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    roomname = db.Column(db.String(64))
    usercount = db.Column(db.Integer, nullable=False)
    banklog = db.Column(db.Integer)
    minbet = db.Column(db.Integer)
    wincondition = db.Column(db.String(64))
    users = db.relationship('User', backref='room')
    decks = db.relationship('Deck', backref='room')


@login_manager.user_loader
def load_user(uid):
    user = User.query.get(uid)
    return user


@app.route('/', methods=["GET"])
def index():
    return render_template('index.html')


@app.route('/createuser', methods=["GET", "POST"])
def createuser():
    if request.form:
        print(request.form)
        username = request.form['username']
        password = request.form['password']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        email = request.form['email']
        taken = User.query.filter_by(username=username).first()
        if bool(taken):
            flash("User was found, try a different name")
            return redirect('/createuser')

        if username == "":
            flash("Username field was null, try again")
            return redirect('/createuser')

        if password == "":
            flash("Password field was null, try again")
            return redirect('/createuser')

        user = User(username=username, password=password, isActive=False)
        profile = Profile(firstname=firstname, lastname=lastname, email=email, cash=0)
        user.profile_id = profile.id

        db.session.add(user)
        db.session.add(profile)
        db.session.commit()
        login_user(user)
        flash("Creation successful!")
        return redirect('/')
    else:
        return render_template('createuser.html')


@app.route('/login', methods=["GET", "POST"])
def login():
    if request.form:
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user is not None:
            if password == user.password:
                login_user(user)
                flash("Login successful!")
                return redirect('/viewprofile')
            else:
                flash("Wrong password, try again")
                return redirect('/login')
        else:
            flash("User not found, try again")
            return redirect('/login')
    else:
        return render_template("login.html")


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/')


@app.route('/viewprofile', methods=["GET"])
@login_required
def viewprof():
    curremail = Profile.query.filter_by(id=current_user.id).first().email
    currfname = Profile.query.filter_by(id=current_user.id).first().firstname
    currlname = Profile.query.filter_by(id=current_user.id).first().lastname
    currcash = Profile.query.filter_by(id=current_user.id).first().cash
    return render_template('viewprofile.html', curremail=curremail, currfname=currfname, currlname=currlname,
                           currcash=currcash)


@app.route('/roombrowser', methods=["GET"])
@login_required
def tb():
    rooms = Room.query.all()
    return render_template('roombrowser.html', rooms=rooms)


@app.route('/gameroom/<id>', methods=["GET"])  # will include /<id> to specify room
@login_required
def gameroom(id):
    cash = getCash()
    return render_template('GameRoom.html', cash=cash, id=id)


@app.route('/singleplayer', methods=["GET"])
@login_required
def singleplayer():
    cash = getCash()
    return render_template('singleplayer.html', cash=cash, )


@app.route('/getCard', methods=["GET"])
@login_required
def getCard():
    deck = Deck.query.filter_by(id=1).first()
    if deck.cardcount == 0:
        recycleDeck(1)
    cards = Card.query.filter_by(deck_id=deck.id).filter_by(dealt=False).all()
    random.seed(69)
    random.shuffle(cards)
    card = random.choice(cards)
    deck.cardcount -= 1
    card.dealt = True
    db.session.commit()
    return jsonify({"value": card.value, "suit": card.suit, "face": card.face})

def recycleDeck(deckid):
    # sets every card in the deck to undealt again, recycling the deck
    deck = Deck.query.filter_by(id=deckid).first()
    cards = Card.query.filter_by(deck_id=deckid).all()
    for card in cards:
        card.dealt = False
    deck.cardcount = len(cards)


@app.route('/getCardcount/<deckid>', methods=["GET"])
@login_required
def getCardcount(deckid):
    deck = Deck.query.filter_by(id=deckid).first()
    return str(deck.cardcount)


@app.route('/resetHand', methods=["GET"])
@login_required
def resethand():
    return 0


@app.route('/getGameState', methods=["GET"])
@login_required
def getgamestate():
    user = User.query.filter_by(id=current_user.get_id()).first()
    return user.gameState


@app.route('/setGameState/<num>', methods=["GET"])
@login_required
def setgamestate(num):
    user = User.query.filter_by(id=current_user.get_id()).first()
    user.gameState = num
    return user.gameState


@app.route('/getCash', methods=["GET"])
@login_required
def getCash():
    currcash = Profile.query.filter_by(id=current_user.get_id()).first().cash
    return str(currcash)


@app.route('/takeCash/<amount>', methods=["GET"])
@login_required
def takeCash(amount):
    prof = Profile.query.filter_by(id=current_user.get_id()).first()
    if prof.cash < int(amount):
        prof.cash = 200     # if the player runs out of cash, they get 200 bucks in gambling welfare
    prof.cash = prof.cash - int(amount)
    db.session.commit()
    return str(prof.cash)


@app.route('/giveCash/<amount>', methods=["GET"])
@login_required
def giveCash(amount):
    prof = Profile.query.filter_by(id=current_user.get_id()).first()
    prof.cash = prof.cash + int(amount)
    db.session.commit()
    return str(prof.cash)

@app.errorhandler(401)
def page_not_found(e):
    return render_template('401.html'), 401

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('500.html'), 500


if __name__ == '__main__':
    app.run()
