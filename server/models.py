from datetime import datetime
from config import db
from sqlalchemy_serializer import SerializerMixin


class User(db.Model,SerializerMixin):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False) 
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    managed_hostels = db.relationship('Hostel', backref='manager', lazy=True)
    bookings = db.relationship('Booking', backref='student', lazy=True)
    announcements = db.relationship('Announcement', backref='sender', lazy=True)
    
    # Complaints sent/received
    complaints_sent = db.relationship('Complaint', foreign_keys='Complaint.sender_id', backref='sender', lazy=True)
    complaints_received = db.relationship('Complaint', foreign_keys='Complaint.receiver_id', backref='receiver', lazy=True)


class Hostel(db.Model,SerializerMixin):
    __tablename__ = 'hostels'
    hostel_id = db.Column(db.Integer, primary_key=True)
    hostel_name = db.Column(db.String(150), nullable=False)
    location_coordinates = db.Column(db.Float, nullable=False) # Consider Two columns (lat/lng) if needed
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False) # e.g., 'active', 'under maintenance'
    images = db.Column(db.String(255), nullable=False) # URL or Path
    amenities = db.Column(db.String(255)) 
    manager_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

    # Relationships
    rooms = db.relationship('Room', backref='hostel', lazy=True, cascade="all, delete-orphan")


class Room(db.Model,SerializerMixin):
    __tablename__ = 'rooms'
    room_id = db.Column(db.Integer, primary_key=True)
    room_type = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    current_occupancy = db.Column(db.Integer, default=0, nullable=False)
    price = db.Column(db.Float, nullable=False)
    images = db.Column(db.String(255), nullable=False)
    hostel_id = db.Column(db.Integer, db.ForeignKey('hostels.hostel_id'), nullable=False)

    # Relationships
    bookings = db.relationship('Booking', backref='room', lazy=True)


class Booking(db.Model,SerializerMixin):
    __tablename__ = 'bookings'
    booking_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.room_id'), nullable=False)
    status = db.Column(db.String(50), nullable=False) # e.g., 'pending', 'confirmed', 'cancelled'
    booking_date = db.Column(db.Date, default=datetime.utcnow, nullable=False)


class Announcement(db.Model,SerializerMixin):
    __tablename__ = 'announcements'
    announcement_id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class Complaint(db.Model,SerializerMixin):
    __tablename__ = 'complaints'
    message_id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)