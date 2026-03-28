
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
        # Use request.form instead of request.get_json()
        hostel_name = request.form.get('hostel_name')
        description = request.form.get('description')
        manager_id = request.form.get('manager_id')
        location_coordinates = request.form.get('location_coordinates', 0.0)
        amenities = request.form.get('amenities')
        
        # Check for the main image
        if 'hostel_image' not in request.files:
            return {'error': 'Hostel image is required'}, 400

        hostel_image_file = request.files.get('hostel_image')
        
        try:
            # Upload main image
            hostel_upload = cloudinary.uploader.upload(hostel_image_file)

            # Create the Hostel
            new_hostel = Hostel(
                hostel_name=hostel_name,
                description=description,
                images=hostel_upload['secure_url'],
                manager_id=manager_id,
                location_coordinates=float(location_coordinates) if location_coordinates is not None else 0.0,
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



if __name__ == '__main__':
    app.run(port=5555, debug=True)