from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
from datetime import datetime

from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
# Enable CORS with credentials support for the frontend origin
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]) 
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

app.config['SECRET_KEY'] = 'finalsecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False # Set to True if using HTTPS

db = SQLAlchemy(app)

# ---------------- MODELS ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(150), nullable=False)
    contact = db.Column(db.String(150), nullable=False)
    image = db.Column(db.String(200))
    type = db.Column(db.String(50), nullable=False, default='lost') # 'lost' or 'found'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('items', lazy=True))
    
    # Helper to serialize object
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'contact': self.contact,
            'type': self.type,
            'image': f'static/uploads/{self.image}' if self.image else None,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else "Unknown",
            'user_joined': self.user.created_at.strftime('%Y') if self.user and self.user.created_at else "2024",
            'date': 'Recently' # Placeholder as date isn't in model yet
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.String(50), nullable=False)
    user = db.Column(db.String(100), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)

# ---------------- API ROUTES ----------------

@app.route('/api/register', methods=["POST"])
def register():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed_pw = generate_password_hash(data["password"])

    user = User(
        username=data.get("username") or data.get("name"),
        email=data["email"],
        password=hashed_pw
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "Registration successful", "user": {"email": user.email, "username": user.username}}), 201

@app.route('/api/login', methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    user = User.query.filter_by(email=data["email"]).first()
    if user and check_password_hash(user.password, data["password"]):
        session["user_id"] = user.id
        session["username"] = user.username
        # Return user info for frontend context
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/logout', methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/user/me', methods=["GET"])
def get_current_user():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user = User.query.get(session["user_id"])
    if not user:
        session.clear()
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

@app.route('/api/user/items', methods=["GET"])
def get_user_items():
    # Dashboard items
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    items = Item.query.filter_by(user_id=session["user_id"]).all()
    return jsonify({"items": [item.to_dict() for item in items]})

@app.route('/api/items', methods=["GET", "POST"])
def handle_items():
    if request.method == "GET":
        # Search or list all
        query = request.args.get("q")
        if query:
            items = Item.query.filter(Item.title.contains(query)).all()
        else:
            items = Item.query.order_by(Item.id.desc()).all()
        return jsonify({"items": [item.to_dict() for item in items]})

    if request.method == "POST":
        if "user_id" not in session:
            return jsonify({"error": "Not authenticated"}), 401
        
        filename = ""
        file = request.files.get("image")

        if file and file.filename != "":
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        item = Item(
            title=request.form["title"],
            description=request.form["description"],
            location=request.form["location"],
            contact=request.form["contact"],
            type=request.form.get("type", "lost"),
            image=filename,
            user_id=session["user_id"]
        )
        db.session.add(item)
        db.session.commit()
        
        return jsonify({"message": "Item posted successfully", "item": item.to_dict()}), 201

# Endpoint to get single item details
@app.route('/api/items/<int:id>', methods=["GET"])
def get_item_detail(id):
    item = Item.query.get_or_404(id)
    return jsonify({"item": item.to_dict()})


# ---------------- SOCKET.IO EVENTS ----------------
@socketio.on('join')
def on_join(data):
    username = data.get('username')
    item_id = data.get('item_id')
    room = item_id
    join_room(room)
    
    # Load previous messages
    messages = Message.query.filter_by(room=room).order_by(Message.id).all()
    history = [{"user": m.user, "text": m.text, "timestamp": m.timestamp} for m in messages]
    
    emit('history', history)

@socketio.on('message')
def handle_message(data):
    room = data.get('room')
    user = data.get('user')
    text = data.get('text')
    timestamp = data.get('timestamp')
    
    # Save to database
    msg = Message(room=room, user=user, text=text, timestamp=timestamp)
    db.session.add(msg)
    db.session.commit()
    
    emit('message', data, room=room)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)
