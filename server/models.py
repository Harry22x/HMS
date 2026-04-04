from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from config import db, bcrypt

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    serialize_rules = ('-_password_hash', '-managed_hostels.manager', '-bookings.student', '-announcements', '-sent_messages', '-received_messages')

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    role = db.Column(db.String, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    
    managed_hostels = db.relationship('Hostel', back_populates='manager', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', back_populates='student', cascade='all, delete-orphan')
    announcements = db.relationship('Announcement', back_populates='sender', cascade='all, delete-orphan')
    
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', back_populates='sender')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', back_populates='receiver')

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hash cannot be accessed")

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email:
            raise ValueError("Invalid email address.")
        return email

class Hostel(db.Model, SerializerMixin):
    __tablename__ = 'hostels'
    
    serialize_rules = ('-rooms.hostel', '-manager.managed_hostels', '-announcements')

    id = db.Column(db.Integer, primary_key=True)
    hostel_name = db.Column(db.String, nullable=False)
    latitude = db.Column(db.Float, nullable=False, default=-1.2921) 
    longitude = db.Column(db.Float, nullable=False, default=36.8219)
    description = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default='active')
    images = db.Column(db.String, nullable=False)
    amenities = db.Column(db.String)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    manager = db.relationship('User', back_populates='managed_hostels')
    rooms = db.relationship('Room', back_populates='hostel', cascade='all, delete-orphan')
    announcements = db.relationship('Announcement', back_populates='hostel', cascade='all, delete-orphan')

class Room(db.Model, SerializerMixin):
    __tablename__ = 'rooms'
    
    serialize_rules = ('-hostel.rooms', '-bookings.room')

    id = db.Column(db.Integer, primary_key=True)
    room_type = db.Column(db.String, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    current_occupancy = db.Column(db.Integer, default=0)
    price = db.Column(db.Float, nullable=False)
    images = db.Column(db.String, nullable=False)
    hostel_id = db.Column(db.Integer, db.ForeignKey('hostels.id'), nullable=False)
    description = db.Column(db.String, nullable =False)

    hostel = db.relationship('Hostel', back_populates='rooms')
    bookings = db.relationship('Booking', back_populates='room', cascade='all, delete-orphan')

    @validates('current_occupancy')
    def validate_occupancy(self, key, occupancy):
        if occupancy > self.capacity:
            raise ValueError("Occupancy cannot exceed room capacity.")
        return occupancy

class Booking(db.Model, SerializerMixin):
    __tablename__ = 'bookings'
    
    serialize_rules = ('-student.bookings', '-room.bookings')

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    status = db.Column(db.String, default='pending')
    booking_date = db.Column(db.DateTime, server_default=db.func.now())

    student = db.relationship('User', back_populates='bookings')
    room = db.relationship('Room', back_populates='bookings')

class Announcement(db.Model, SerializerMixin):
    __tablename__ = 'announcements'
    
    serialize_rules = ()

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    hostel_id = db.Column(db.Integer, db.ForeignKey('hostels.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    sender = db.relationship('User', back_populates='announcements')
    hostel = db.relationship('Hostel', back_populates='announcements')

class Message(db.Model, SerializerMixin):
    __tablename__ = 'messages'
    
    serialize_rules = ('-sender.sent_messages', '-sender.received_messages', '-receiver.sent_messages', '-receiver.received_messages')

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], back_populates='received_messages')