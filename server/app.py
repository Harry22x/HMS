
from config import app, db, migrate,api  
from models import User, Hostel, Room, Booking, Announcement, Message 
from flask import request,make_response,session,jsonify
from flask_restful import Resource
from datetime import timedelta, datetime
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import cloudinary
import cloudinary.api
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

cloudinary.config(
    cloud_name="dvgbwrvl1",
    api_key ="834853499714232",
    api_secret = "qkGOMCLPk8oM0C2Q0B3gSypU8hg",
    secure = True
)



class Hostels(Resource):
    def get(self):
        hostels = [{
            "id": hostel.id,
            "hostel_name": hostel.hostel_name,
            "latitude": hostel.latitude,
            "longitude": hostel.longitude,
            "images":hostel.images,
            "amenities": hostel.amenities,
            "description":hostel.description,
            "status":hostel.status,
            "manager_name":hostel.manager.full_name,
            "manager_email": hostel.manager.email


        } for hostel in Hostel.query.all()]
        return make_response(hostels,200)
    def post(self):
       
        hostel_name = request.form.get('hostel_name')
        description = request.form.get('description')
        manager_id = request.form.get('manager_id')
        longitude = request.form.get('longitude')
        latitude = request.form.get('latitude')

        amenities = request.form.get('amenities')
        
     
        if 'hostel_image' not in request.files:
            return {'error': 'Hostel image is required'}, 400

        hostel_image_file = request.files.get('hostel_image')
        
        try:
            
            hostel_upload = cloudinary.uploader.upload(hostel_image_file)

           
            new_hostel = Hostel(
                hostel_name=hostel_name,
                description=description,
                images=hostel_upload['secure_url'],
                manager_id=manager_id,
                longitude = longitude,
                latitude = latitude,
                amenities=amenities,
                status="pending"
            )
            db.session.add(new_hostel)
            db.session.flush()

            # Parse the rooms JSON string back into a list
            import json
            rooms_info = json.loads(request.form.get('rooms_info', '[]'))

            for index, r_data in enumerate(rooms_info):
                # Find the specific image for this room
                room_img_file = request.files.get(f'room_image_{index}')
                room_url = hostel_upload['secure_url'] # Default

                if room_img_file:
                    room_upload = cloudinary.uploader.upload(room_img_file)
                    room_url = room_upload['secure_url']

                new_room = Room(
                    room_type=r_data['room_type'],
                    capacity=r_data['capacity'],
                    price=r_data['price'],
                    description=r_data.get('description', ''),
                    images=room_url,
                    hostel_id=new_hostel.id
                )
                db.session.add(new_room)

            db.session.commit()
            return make_response(new_hostel.to_dict(), 201)

        except Exception as e:
            db.session.rollback()
            return make_response({"error": str(e)}, 400)    

class GetHostelById(Resource):
    def get(self,id):
        hostel = Hostel.query.filter_by(id=id).first()
        if hostel:
            return make_response(hostel.to_dict(),200) 
        else:
            return make_response({"error":"Hostel does not exist"},404)    
        
    def patch(self, id):
            hostel = Hostel.query.filter_by(id=id).first()
            if not hostel:
                return {"error": "Hostel not found"}, 404
            
            # Try to get JSON data (for admin status changes)
            data = request.get_json(silent=True) or {}
            current_user_role = data.get('current_user_role')

            # Strict Admin-Only Status Logic
            if 'status' in data:
                if current_user_role != 'admin':
                    return {"error": "Unauthorized: Only admins can change hostel status"}, 403
                hostel.status = data['status']
                print(f"Admin updated hostel {id} status to {data['status']}")
            
            # Manager can edit hostel details (via FormData)
            if current_user_role == 'manager' or request.form:
                hostel.hostel_name = request.form.get('hostel_name', hostel.hostel_name)
                hostel.description = request.form.get('description', hostel.description)
                hostel.latitude = float(request.form.get('latitude', hostel.latitude))
                hostel.longitude = float(request.form.get('longitude', hostel.longitude))
                hostel.amenities = request.form.get('amenities', hostel.amenities)

                if 'hostel_image' in request.files:
                    file_to_upload = request.files['hostel_image']
                    upload_result = cloudinary.uploader.upload(file_to_upload)
                    hostel.images = upload_result['secure_url']

            try:
                db.session.commit()
                return make_response(hostel.to_dict(), 200)
            except Exception as e:
                db.session.rollback()
                return make_response({"error": str(e)}, 400)
    def delete(self, id):
        hostel = Hostel.query.get(id)
        if not hostel:
            return {"error": "Hostel not found"}, 404

        has_active_bookings = any(
            len([b for b in room.bookings if b.status == 'active']) > 0 
            for room in hostel.rooms
        )

        if has_active_bookings:
            return {"error": "Cannot delete hostel with active student bookings."}, 400

        db.session.delete(hostel)
        db.session.commit()
        return {"message": "Hostel and all associated rooms deleted successfully"}, 200
            


class RoomById(Resource):
    def patch(self, id):
        room = Room.query.filter_by(id=id).first()
        if not room:
            return {"error": "Room not found"}, 404

        # Update text fields
        room.room_type = request.form.get('room_type', room.room_type)
        room.capacity = int(request.form.get('capacity', room.capacity))
        room.price = float(request.form.get('price', room.price))
        room.description = request.form.get('description', room.description)

        # Handle Image Update
        if 'room_image' in request.files:
            upload_result = cloudinary.uploader.upload(request.files['room_image'])
            room.images = upload_result['secure_url']

        db.session.commit()
        return make_response(room.to_dict(), 200)
    def delete(self, id):
        room = Room.query.get(id)
        if not room:
            return {"error": "Room not found"}, 404

       
        if room.current_occupancy > 0:
            return {"error": "Cannot delete room while students are still checked in."}, 400

        db.session.delete(room)
        db.session.commit()
        return {"message": "Room deleted successfully"}, 200
    
class Signup(Resource):
    def post(self):
        data = request.get_json()
        
        #  Validation
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not all([full_name, email, password, role]):
            return {"error": "All fields are required"}, 400

        #  Check if user already exists
        if User.query.filter_by(email=email).first():
            return {"error": "Email already registered"}, 400

        try:
 
            new_user = User(
                full_name=full_name,
                email=email,
                role=role
            )
           
            new_user.password_hash = password 

            db.session.add(new_user)
            db.session.commit()

            access_token = create_access_token(identity=str(new_user.id), expires_delta=timedelta(days=14))
            return {'access_token': access_token}, 201


        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

class Login(Resource):
    def post(self):
        data = request.get_json()
        
        
        print(f"Type of data: {type(data)}, Value: {data}")
        user = User.query.filter_by(email = data.get('email')).first()

        if user and user.authenticate(data.get('password','')):
            access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=14))
            return {'access_token': access_token}, 200
        
        return {'error': 'Invalid credentials'}, 401
    

class CheckSession(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if user_id:
            return make_response(user.to_dict(),200)
        else:
            return make_response({"error":"User does not exist"},404)

class Bookings(Resource):
    def post(self):
        data = request.get_json()
        user_id = data.get('user_id')
        room_id = data.get('room_id')

        #This checks if th room exists
        room = Room.query.get(room_id)
        if not room:
            return {"error": "Room not found"}, 404

       # This checks if the room has any space left
        if room.current_occupancy >= room.capacity:
            return {"error": "Room is already at full capacity!"}, 400

        # 3. Safety Check: Has the student already booked here?
        existing_booking = Booking.query.filter_by(student_id=user_id, room_id=room_id).first()
        if existing_booking:
            return {"error": "You already have an active booking for this room."}, 400

        try:
            # 4. now we create the booking
            new_booking = Booking(
                student_id=user_id,
                room_id=room_id,
                booking_date=datetime.utcnow(),
                status="pending"
            )
            
            # 5. Increment occupancy
            room.current_occupancy += 1

            db.session.add(new_booking)
            db.session.commit()

            return make_response(new_booking.to_dict(), 201)

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
class BookingByID(Resource):
    def delete(self, id):
        booking = Booking.query.get(id)
        if not booking:
            return {"error": "Booking not found"}, 404

        try:
            # 1. Find the associated room
            room = Room.query.get(booking.room_id)
            
            # 2. Decrement occupancy (Safety: don't go below 0)
            if room and room.current_occupancy > 0:
                room.current_occupancy -= 1

            # 3. Remove the booking
            db.session.delete(booking)
            db.session.commit()
            
            return {"message": "Booking cancelled and room space released"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    def patch(self, id):
        data = request.get_json()
        booking = Booking.query.get(id)
        
        if not booking:
            return {"error": "Booking not found"}, 404

        # Check if we are updating the status
        if 'status' in data:
            new_status = data['status']
            
            # Security check: Only managers can approve/reject bookings
            if new_status in ('approved', 'rejected'):
                user_id = data.get('user_id')
                user_role = data.get('user_role')
                
                # Verify user is a manager
                if user_role != 'manager':
                    return {"error": "Unauthorized: Only managers can update booking status"}, 403
                
                # Get the room and hostel to verify the manager owns this hostel
                room = Room.query.get(booking.room_id)
                if not room:
                    return {"error": "Room not found"}, 404
                
                hostel = Hostel.query.get(room.hostel_id)
                if not hostel:
                    return {"error": "Hostel not found"}, 404
                
                # Verify the user is the manager of this hostel
                if hostel.manager_id != user_id:
                    return {"error": "Unauthorized: You do not manage this hostel"}, 403
            
            # Logic: If changing TO rejected, free up the room spot
            if new_status == 'rejected' and booking.status != 'rejected':
                room = Room.query.get(booking.room_id)
                if room.current_occupancy > 0:
                    room.current_occupancy -= 1
            
            # Logic: If changing FROM rejected back to approved, take a spot
            elif new_status == 'approved' and booking.status == 'rejected':
                room = Room.query.get(booking.room_id)
                if room.current_occupancy < room.capacity:
                    room.current_occupancy += 1
                else:
                    return {"error": "Room is now full, cannot approve"}, 400

            booking.status = new_status

       

        db.session.commit()
        return make_response(booking.to_dict(), 200)
    
class Announcements(Resource):
    def get(self):
        # Fetch all announcements which we'll order by newest first
        announcements = Announcement.query.order_by(Announcement.timestamp.desc()).all()
        return make_response([a.to_dict() for a in announcements], 200)
    
    def post(self):
        data = request.get_json()
        
        # Check if this manager actually owns this hostel
        hostel = Hostel.query.get(data.get('hostel_id'))
        if not hostel or hostel.manager_id != data.get('sender_id'):
            return {"error": "Unauthorized: You do not manage this hostel"}, 403

        new_announcement = Announcement(
            sender_id=data.get('sender_id'),
            hostel_id=data.get('hostel_id'),
            content=data.get('content')
        )
        
        db.session.add(new_announcement)
        db.session.commit()
        return make_response(new_announcement.to_dict(), 201)

# New route to get announcements for a specific hostel
class HostelAnnouncements(Resource):
    def get(self, hostel_id):
        announcements = Announcement.query.filter_by(hostel_id=hostel_id).order_by(Announcement.timestamp.desc()).all()
        return make_response([a.to_dict() for a in announcements], 200)

class Messages(Resource):
    def get(self):
        # Fetch messages where the current user is either the sender OR receiver
        user_id = request.args.get('user_id')
        messages = Message.query.filter(
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        ).order_by(Message.timestamp.asc()).all()
        return make_response([m.to_dict() for m in messages], 200)

    def post(self):
        data = request.get_json()
        new_msg = Message(
            sender_id=data.get('sender_id'),
            receiver_id=data.get('receiver_id'),
            content=data.get('content')
        )
        db.session.add(new_msg)
        db.session.commit()
        return make_response(new_msg.to_dict(), 201)

class ApprovedContacts(Resource):
    def get(self, user_id):
        # Get the current user to determine their role
        user = User.query.get(user_id)
        if not user:
            return make_response({"error": "User not found"}, 404)
        
        contacts = []
        
        if user.role == 'student':
            # For students: Get managers of hostels where they have approved bookings
            approved_bookings = Booking.query.filter_by(student_id=user_id, status='approved').all()
            manager_ids = set()
            
            for booking in approved_bookings:
                room = Room.query.get(booking.room_id)
                if room:
                    hostel = Hostel.query.get(room.hostel_id)
                    if hostel:
                        manager_ids.add(hostel.manager_id)
            
            if manager_ids:
                contacts = User.query.filter(User.id.in_(manager_ids)).all()
        
        elif user.role == 'manager':
            # For managers: Get students with approved bookings in their hostels
            manager_hostels = Hostel.query.filter_by(manager_id=user_id).all()
            hostel_ids = [h.id for h in manager_hostels]
            
            if hostel_ids:
                # Get all rooms in these hostels
                rooms = Room.query.filter(Room.hostel_id.in_(hostel_ids)).all()
                room_ids = [r.id for r in rooms]
                
                # Get students with approved bookings in these rooms
                if room_ids:
                    approved_bookings = Booking.query.filter(
                        Booking.room_id.in_(room_ids),
                        Booking.status == 'approved'
                    ).all()
                    
                    student_ids = set(b.student_id for b in approved_bookings)
                    if student_ids:
                        contacts = User.query.filter(User.id.in_(student_ids)).all()
        
        elif user.role == 'admin':
            # For admins: Get all users who have sent them messages
            sender_ids = db.session.query(Message.sender_id).filter(Message.receiver_id == user_id).distinct().all()
            sender_ids = [sid[0] for sid in sender_ids]
            
            if sender_ids:
                contacts = User.query.filter(User.id.in_(sender_ids)).all()
        
        # Add admin to contacts for students and managers (not for admin themselves)
        if user.role in ('student', 'manager'):
            admin = User.query.filter_by(role='admin').first()
            if admin:
                contacts.append(admin)
        
        return make_response([c.to_dict() for c in contacts], 200)



api.add_resource(Signup, '/signup')
api.add_resource(ApprovedContacts, '/users/<int:user_id>/approved-contacts')
api.add_resource(Messages, '/messages')
api.add_resource(Announcements, '/announcements')
api.add_resource(HostelAnnouncements, '/hostels/<int:hostel_id>/announcements')
api.add_resource(Bookings, '/bookings')
api.add_resource(Hostels,'/hostels')
api.add_resource(GetHostelById,'/hostels/<int:id>')
api.add_resource(Login,'/login')
api.add_resource(CheckSession,'/check_session')
api.add_resource(RoomById,'/rooms/<int:id>')
api.add_resource(BookingByID,'/bookings/<int:id>')



if __name__ == '__main__':
    app.run(port=5555, debug=True)