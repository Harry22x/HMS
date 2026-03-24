
from config import app, db, migrate,api  
from models import User, Hostel, Room, Booking, Announcement, Complaint 
from flask import request,make_response,session,jsonify
from flask_restful import Resource


class Hostels(Resource):
    def get(self):
        hostels = [{
            "id": hostel.id,
            "name": hostel.hostel_name,
            "location_coordinates" : hostel.location_coordinates,
            "image":hostel.images,
            "amenities": hostel.amenities,
            "description":hostel.description

        } for hostel in Hostel.query.all()]
        return make_response(hostels,200)


class GetHostelById(Resource):
    def get(self,id):
        hostel = Hostel.query.filter_by(id=id).first()
        if hostel:
            return make_response(hostel.to_dict(),200) 
        else:
            return make_response({"error":"Hostel does not exist"},404)       
    
api.add_resource(Hostels,'/hostels')
api.add_resource(GetHostelById,'/hostels/<int:id>')


if __name__ == '__main__':
    app.run(port=5555, debug=True)