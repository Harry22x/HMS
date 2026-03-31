
from config import app, db, migrate,api  
from models import User, Hostel, Room, Booking, Announcement, Complaint 
from flask import request,make_response,session,jsonify
from flask_restful import Resource
from datetime import timedelta
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
            "name": hostel.hostel_name,
            "latitude": hostel.latitude,
            "longitude": hostel.longitude,
            "image":hostel.images,
            "amenities": hostel.amenities,
            "description":hostel.description

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
                status="active"
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
              
    
api.add_resource(Hostels,'/hostels')
api.add_resource(GetHostelById,'/hostels/<int:id>')
api.add_resource(Login,'/login')
api.add_resource(CheckSession,'/check_session')
api.add_resource(RoomById,'/rooms/<int:id>')



if __name__ == '__main__':
    app.run(port=5555, debug=True)