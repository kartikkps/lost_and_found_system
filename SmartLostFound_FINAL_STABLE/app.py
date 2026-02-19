from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import re
import logging
from flask_cors import CORS
from datetime import datetime

from flask_socketio import SocketIO, emit, join_room, leave_room

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('flask_cors')
logger.level = logging.DEBUG

app = Flask(__name__)

# Enable CORS with credentials support for the frontend origin
# regex allows any IP on port 5173 or 3000 (common frontend ports)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "http://localhost:3000",
    "http://10.209.104.250:5173", # Explicitly add user IP
    re.compile(r"^http://.*:5173$"),
    re.compile(r"^http://.*:3000$")
])
socketio = SocketIO(app, cors_allowed_origins="*")

@app.before_request
def handle_options_requests():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

@app.before_request
def log_request():
    app.logger.info(f"REQUEST: {request.method} {request.full_path}")
    app.logger.info(f"Origin: {request.headers.get('Origin')}")

@app.route('/')
def hello():
    return "Hello from Flask!"

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SECRET_KEY'] = 'finalsecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False # Set to True if using HTTPS

db = SQLAlchemy(app)

# ---------------- MODELS ----------------
# ... (rest of models)

# ... (omitted file content) ...



# ---------------- MODELS ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    profile_image = db.Column(db.String(200), default=None)
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
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
            'date': self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat()
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.String(50), nullable=False)
    sender_id = db.Column(db.Integer, nullable=False)
    user = db.Column(db.String(100), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='sent') # sent, delivered, read

# Global set to track online users (in-memory)
connected_users = set()

# ... (API Routes remain same)

# ---------------- SOCKET.IO EVENTS ----------------

@socketio.on('connect')
def on_connect():
    if "user_id" in session:
        connected_users.add(session["user_id"])

@socketio.on('disconnect')
def on_disconnect():
    if "user_id" in session:
        connected_users.discard(session["user_id"])

@socketio.on('join')
def on_join(data):
    username = data.get('username')
    room = data.get('room')
    user_id = session.get("user_id") # Get current user ID from session
    
    join_room(room)
    
    # Mark unread messages in this room as read (if they were sent by the OTHER user)
    # We need to find messages in this room where sender_id != current user and status != 'read'
    if user_id:
        unread_msgs = Message.query.filter(
            Message.room == room,
            Message.sender_id != user_id,
            Message.status != 'read'
        ).all()
        
        updated_ids = []
        for msg in unread_msgs:
            msg.status = 'read'
            updated_ids.append(msg.id)
        
        if updated_ids:
            db.session.commit()
            # Notify the sender that messages were read
            emit('messages_read', {'message_ids': updated_ids, 'room': room}, room=room)

    # Load previous messages
    messages = Message.query.filter_by(room=room).order_by(Message.id).all()
    history = [{
        "id": m.id,
        "sender_id": m.sender_id,
        "user": m.user,
        "text": m.text,
        "timestamp": m.timestamp,
        "status": m.status
    } for m in messages]
    
    emit('history', history)

@socketio.on('message')
def handle_message(data):
    room = data.get('room')
    user = data.get('user')
    sender_id = data.get('sender_id')
    text = data.get('text')
    timestamp = data.get('timestamp')
    
    # Determine initial status
    # Parse room to find recipient: item-{item_id}-{buyer_id}
    # But wait, room ID doesn't explicitly say who is who.
    # However, we can check if the OTHER user is connected.
    # Simple Logic for MVP:
    # If ANYONE else is in the socket room, mark as 'read' (since they are looking at it).
    # If not in room but in connected_users, mark as 'delivered'.
    # Else 'sent'.
    
    # This is tricky with Flask-SocketIO rooms. We can't easily list users in a room without external storage.
    # Let's rely on client acknowledgment for 'read' ideally, but for now:
    # We will start with 'sent'.
    # If recipient is online -> 'delivered'.
    
    initial_status = 'sent'
    
    # Attempt to identify recipient
    try:
        parts = room.split('-')
        item_id = int(parts[1])
        buyer_id = int(parts[2])
        # If I am buyer, recipient is seller.
        # Need to fetch item to know seller.
        item = Item.query.get(item_id)
        if item:
            recipient_id = item.user_id if sender_id == buyer_id else buyer_id
            
            if recipient_id in connected_users:
                initial_status = 'delivered'
    except:
        pass

    msg = Message(room=room, sender_id=sender_id, user=user, text=text, timestamp=timestamp, status=initial_status)
    db.session.add(msg)
    db.session.commit()
    
    # Broadcast message with ID and status
    data['id'] = msg.id
    data['status'] = msg.status
    emit('message', data, room=room)

@socketio.on('mark_read')
def handle_mark_read(data):
    # Client sends this when they see messages
    room = data.get('room')
    user_id = session.get('user_id')
    
    if user_id:
        # Mark all messages in room sent by OTHERS as read
        unread_msgs = Message.query.filter(
            Message.room == room,
            Message.sender_id != user_id,
            Message.status != 'read'
        ).all()
        
        updated_ids = []
        for msg in unread_msgs:
            msg.status = 'read'
            updated_ids.append(msg.id)
            
        if updated_ids:
            db.session.commit()
            emit('messages_read', {'message_ids': updated_ids, 'room': room}, room=room)

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
            "email": user.email,
            "profile_image": f'static/uploads/{user.profile_image}' if user.profile_image else None
        }
    })

@app.route('/api/user/profile', methods=["POST"])
def update_profile():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user = User.query.get(session["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Update text fields
    if "username" in request.form:
        user.username = request.form["username"]
        
    # Handle Image Upload
    file = request.files.get("profile_image")
    if file and file.filename != "":
        filename = secure_filename(f"profile_{user.id}_{int(datetime.utcnow().timestamp())}_{file.filename}")
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)
        user.profile_image = filename
        
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_image": f'static/uploads/{user.profile_image}' if user.profile_image else None
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
@app.route('/api/items/<int:id>', methods=["GET", "DELETE"])
def handle_item_detail(id):
    item = Item.query.get_or_404(id)

    if request.method == "GET":
        return jsonify({"item": item.to_dict()})

    if request.method == "DELETE":
        if "user_id" not in session:
            return jsonify({"error": "Not authenticated"}), 401
        
        # Verify ownership
        if item.user_id != session["user_id"]:
            return jsonify({"error": "Unauthorized"}), 403

        # Optional: Delete image file if it exists
        if item.image:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], item.image)
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                except Exception as e:
                    print(f"Error deleting image: {e}")

        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item deleted successfully"}), 200



@app.route('/api/chats', methods=["GET"])
def get_user_chats():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    current_user_id = session["user_id"]
    
    # Get all unique rooms where the user has sent a message OR is implied in the room ID
    # Strategy: 
    # 1. Get all messages. 
    # 2. Extract unique rooms.
    # 3. Filter rooms relevant to the user.
    # 4. Construct chat summary.
    
    # Optimization: Filter messages by user participation is hard because of "room" string.
    # Simpler approach for MVP: Iterate all unique rooms in Message table.
    
    unique_rooms = db.session.query(Message.room).distinct().all()
    unique_rooms = [r[0] for r in unique_rooms]
    
    chats = []
    
    for room in unique_rooms:
        # Expected format: item-{item_id}-{buyer_id}
        parts = room.split('-')
        if len(parts) != 3 or parts[0] != 'item':
            continue
            
        try:
            item_id = int(parts[1])
            buyer_id = int(parts[2])
        except ValueError:
            continue
            
        item = Item.query.get(item_id)
        if not item:
            continue
            
        # Check if user is involved
        is_buyer = (current_user_id == buyer_id)
        is_seller = (item.user_id == current_user_id)
        
        if is_buyer or is_seller:
            # Get other user's name
            other_user_name = "Unknown"
            if is_buyer:
                # I am buyer, chatting with seller
                other_user_name = item.user.username
            else:
                # I am seller, chatting with buyer
                buyer = User.query.get(buyer_id)
                if buyer:
                    other_user_name = buyer.username
            
            # Get last message
            last_msg = Message.query.filter_by(room=room).order_by(Message.id.desc()).first()
            
            chats.append({
                "room": room,
                "item_title": item.title,
                "item_id": item.id,
                "other_user": other_user_name,
                "last_message": last_msg.text if last_msg else "",
                "timestamp": last_msg.timestamp if last_msg else ""
            })
    
    return jsonify({"chats": chats})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # Host 0.0.0.0 allows external access
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
