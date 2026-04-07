import pytest
import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # We import to load routes


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
        print("Booking test case: ")
        print("Status Code: ", response)
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

    def test_manager_approve_booking(self, client, seed_hostel):
        """PATCH /bookings/<id> allows a manager to approve a pending booking."""
        from models import Room, User, Booking, Hostel

        with app.app_context():
            # Get the manager from the seeded hostel
            hostel = Hostel.query.get(seed_hostel)
            manager_id = hostel.manager_id
            
            # Create a student
            student = User(full_name='approval student', email='approval@example.com', role='student')
            student.password_hash = 'password123'
            db.session.add(student)
            db.session.commit()
            student_id = student.id
            
            # Get the room from the seeded hostel
            room = Room.query.filter_by(hostel_id=seed_hostel).first()
            room_id = room.id
            
            # Create a booking
            booking = Booking(student_id=student_id, room_id=room_id, status='pending')
            db.session.add(booking)
            db.session.commit()
            booking_id = booking.id

        # Manager approves the booking
        response = client.patch(
            f'/bookings/{booking_id}',
            json={
                'status': 'approved',
                'user_id': manager_id,
                'user_role': 'manager'
            },
            content_type='application/json'
        )
        
        print("Booking approval test case:")
        print("Status Code: ", response)
        print("Database booking status: ",response.get_json()['status'])


        assert response.status_code == 200
        assert response.get_json()['status'] == 'approved'

        # This verifIes that booking status attribute is updated in the database
        with app.app_context():
            updated_booking = Booking.query.get(booking_id)
            assert updated_booking.status == 'approved'