import pytest
import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # Import to load routes


class TestBookingRoutes:
    def test_book_hostel_success(self, client, seed_hostel):
        """POST /bookings creates a booking and increments room occupancy."""
        from models import Room, User

        with app.app_context():
            student = User(full_name='booking student', email='booking@example.com', role='student')
            student.password_hash = 'password123'
            db.session.add(student)
            db.session.commit()
            room = Room.query.filter_by(hostel_id=seed_hostel).first()
            student_id = student.id
            room_id = room.id

        response = client.post(
            '/bookings',
            json={'user_id': student_id, 'room_id': room_id},
            content_type='application/json'
        )
        
        print(response.get_json())
        assert response.status_code == 201
        assert response.get_json()['student_id'] == student_id

        with app.app_context():
            refreshed_room = Room.query.get(room_id)
            assert refreshed_room.current_occupancy == 1

    def test_book_hostel_full_capacity(self, client, seed_hostel):
        """POST /bookings rejects a request when the room is full."""
        from models import Room, User

        with app.app_context():
            room = Room.query.filter_by(hostel_id=seed_hostel).first()
            room.current_occupancy = room.capacity
            student = User(full_name='overflow student', email='overflow@example.com', role='student')
            student.password_hash = 'password123'
            db.session.add(student)
            db.session.commit()
            student_id = student.id
            room_id = room.id

        response = client.post(
            '/bookings',
            json={'user_id': student_id, 'room_id': room_id},
            content_type='application/json'
        )
        assert response.status_code == 400
        assert 'full capacity' in response.get_json()['error'].lower()