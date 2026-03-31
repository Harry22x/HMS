import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # Import to load routes


# ─────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────

@pytest.fixture
def client():
    """Set up a test Flask client with an in-memory SQLite database."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'

    with app.app_context():
        from models import User, Hostel, Room, Booking, Announcement, Complaint
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def auth_headers(client):
    """Return JWT auth headers for a test user."""
    from models import User
    
    

    with app.app_context():
        user = User(
            full_name='testuser',
            email='test@example.com',
            role='student'
        )
        user.password_hash = 'password123'
        db.session.add(user)
        db.session.commit()

        response = client.post(
            '/login',
            json={'email': 'test@example.com', 'password': 'password123'},
            content_type='application/json'
        )
        token = response.get_json()['access_token']
        return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def seed_hostel(client):
    """Create and return a seeded hostel (with one room) for use in tests."""
    from models import Hostel, Room

    with app.app_context():
        hostel = Hostel(
            hostel_name='Test Hostel',
            description='A cozy place',
            images='https://example.com/hostel.jpg',
            manager_id=1,
            longitude=36.82,
            latitude=-1.29,
            amenities='WiFi, Water',
            status='active'
        )
        db.session.add(hostel)
        db.session.flush()

        room = Room(
            room_type='single',
            capacity=1,
            price=5000.0,
            description='Single room',
            images='https://example.com/room.jpg',
            hostel_id=hostel.id,
            current_occupancy=0
        )
        db.session.add(room)
        db.session.commit()
        return hostel.id



# Login Tests


class TestLogin:
    def test_login_success(self, client):
        """Valid credentials return a JWT access token."""
        from models import User

        with app.app_context():
            user = User(
                full_name='loginuser',
                email='login@example.com',
                role='student'
            )
            user.password_hash = 'secret'
            db.session.add(user)
            db.session.commit()

        response = client.post(
            '/login',
            json={'email': 'login@example.com', 'password': 'secret'},
            content_type='application/json'
        )
        assert response.status_code == 200
        assert 'access_token' in response.get_json()

    def test_login_invalid_password(self, client):
        """Wrong password returns 401."""
        from models import User


        with app.app_context():
            user = User(
                full_name='badpassuser',
                email='badpass@example.com',
                role='student'
            )
            user.password_hash = 'correct'
            db.session.add(user)
            db.session.commit()

        response = client.post(
            '/login',
            json={'email': 'badpass@example.com', 'password': 'wrong'},
            content_type='application/json'
        )
        assert response.status_code == 401
        assert response.get_json()['error'] == 'Invalid credentials'

    def test_login_nonexistent_user(self, client):
        """Email that doesn't exist returns 401."""
        response = client.post(
            '/login',
            json={'email': 'ghost@example.com', 'password': 'anything'},
            content_type='application/json'
        )
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        """Empty body should not crash the server."""
        response = client.post(
            '/login',
            json={},
            content_type='application/json'
        )
        assert response.status_code == 401



# CheckSession Tests


class TestCheckSession:
    def test_check_session_authenticated(self, client, auth_headers):
        """Valid JWT returns the current user's data."""
        response = client.get('/check_session', headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data['email'] == 'test@example.com'

    def test_check_session_no_token(self, client):
        """Request without a token is rejected."""
        response = client.get('/check_session')
        assert response.status_code == 401

    def test_check_session_invalid_token(self, client):
        """Malformed/invalid token is rejected."""
        response = client.get(
            '/check_session',
            headers={'Authorization': 'Bearer totally.invalid.token'}
        )
        assert response.status_code == 422



# Hostels Tests


class TestHostels:
    def test_get_all_hostels_empty(self, client):
        """GET /hostels returns an empty list when no hostels exist."""
        response = client.get('/hostels')
        assert response.status_code == 200
        assert response.get_json() == []

    def test_get_all_hostels_with_data(self, client, seed_hostel):
        """GET /hostels returns all seeded hostels."""
        response = client.get('/hostels')
        assert response.status_code == 200
        hostels = response.get_json()
        assert len(hostels) == 1
        assert hostels[0]['name'] == 'Test Hostel'

    @patch('cloudinary.uploader.upload')
    def test_create_hostel_success(self, mock_upload, client):
        """POST /hostels with valid form data creates a hostel."""
        mock_upload.return_value = {'secure_url': 'https://cloudinary.com/hostel.jpg'}

        from io import BytesIO
        data = {
            'hostel_name': 'New Hostel',
            'description': 'Nice place',
            'manager_id': '1',
            'longitude': '36.82',
            'latitude': '-1.29',
            'amenities': 'Gym, WiFi',
            'rooms_info': json.dumps([
                {'room_type': 'double', 'capacity': 2, 'price': 8000}
            ]),
            'hostel_image': (BytesIO(b'fake image data'), 'hostel.jpg'),
        }
        response = client.post(
            '/hostels',
            data=data,
            content_type='multipart/form-data'
        )
        assert response.status_code == 201
        result = response.get_json()
        assert result['hostel_name'] == 'New Hostel'

    def test_create_hostel_missing_image(self, client):
        """POST /hostels without an image returns 400."""
        data = {
            'hostel_name': 'No Image Hostel',
            'description': 'Missing image',
            'manager_id': '1',
            'longitude': '36.82',
            'latitude': '-1.29',
            'amenities': 'None',
            'rooms_info': json.dumps([]),
        }
        response = client.post(
            '/hostels',
            data=data,
            content_type='multipart/form-data'
        )
        assert response.status_code == 400
        assert 'error' in response.get_json()



# GetHostelById Tests

class TestGetHostelById:
    def test_get_hostel_by_id_found(self, client, seed_hostel):
        """GET /hostels/<id> returns the correct hostel."""
        response = client.get(f'/hostels/{seed_hostel}')
        assert response.status_code == 200
        assert response.get_json()['hostel_name'] == 'Test Hostel'

    def test_get_hostel_by_id_not_found(self, client):
        """GET /hostels/<id> with a non-existent ID returns 404."""
        response = client.get('/hostels/9999')
        assert response.status_code == 404
        assert response.get_json()['error'] == 'Hostel does not exist'

    @patch('cloudinary.uploader.upload')
    def test_patch_hostel(self, mock_upload, client, seed_hostel):
        """PATCH /hostels/<id> updates hostel fields."""
        mock_upload.return_value = {'secure_url': 'https://cloudinary.com/new.jpg'}

        data = {
            'hostel_name': 'Updated Hostel',
            'description': 'Updated description',
            'latitude': '-1.30',
            'longitude': '36.83',
            'amenities': 'Pool, WiFi',
        }
        response = client.patch(
            f'/hostels/{seed_hostel}',
            data=data,
            content_type='multipart/form-data'
        )
        assert response.status_code == 200
        assert response.get_json()['hostel_name'] == 'Updated Hostel'

    def test_patch_hostel_not_found(self, client):
        """PATCH /hostels/<id> on missing hostel returns 404."""
        response = client.patch(
            '/hostels/9999',
            data={'hostel_name': 'Ghost'},
            content_type='multipart/form-data'
        )
        assert response.status_code == 404

    def test_delete_hostel_success(self, client, seed_hostel):
        """DELETE /hostels/<id> removes a hostel with no active bookings."""
        response = client.delete(f'/hostels/{seed_hostel}')
        assert response.status_code == 200
        assert 'deleted successfully' in response.get_json()['message']

    def test_delete_hostel_not_found(self, client):
        """DELETE /hostels/<id> on missing hostel returns 404."""
        response = client.delete('/hostels/9999')
        assert response.status_code == 404

    def test_delete_hostel_with_active_bookings(self, client, seed_hostel):
        """DELETE /hostels/<id> is blocked when active bookings exist."""
        from models import Booking, Room
        with app.app_context():
            room = Room.query.filter_by(hostel_id=seed_hostel).first()
            booking = Booking(
                student_id=1,
                room_id=room.id,
                status='active'
            )
            db.session.add(booking)
            db.session.commit()

        response = client.delete(f'/hostels/{seed_hostel}')
        assert response.status_code == 400
        assert 'active' in response.get_json()['error'].lower()


# ─────────────────────────────────────────────
# RoomById Tests
# ─────────────────────────────────────────────

class TestRoomById:
    def _get_room_id(self, seed_hostel):
        from models import Room
        with app.app_context():
            room = Room.query.filter_by(hostel_id=seed_hostel).first()
            return room.id

    @patch('cloudinary.uploader.upload')
    def test_patch_room_success(self, mock_upload, client, seed_hostel):
        """PATCH /rooms/<id> updates room fields."""
        mock_upload.return_value = {'secure_url': 'https://cloudinary.com/room_new.jpg'}
        room_id = self._get_room_id(seed_hostel)

        data = {
            'room_type': 'double',
            'capacity': '2',
            'price': '9000',
            'description': 'Updated room',
        }
        response = client.patch(
            f'/rooms/{room_id}',
            data=data,
            content_type='multipart/form-data'
        )
        assert response.status_code == 200
        assert response.get_json()['room_type'] == 'double'

    def test_patch_room_not_found(self, client):
        """PATCH /rooms/<id> on a missing room returns 404."""
        response = client.patch(
            '/rooms/9999',
            data={'room_type': 'suite'},
            content_type='multipart/form-data'
        )
        assert response.status_code == 404

    def test_delete_room_success(self, client, seed_hostel):
        """DELETE /rooms/<id> removes a room with no current occupants."""
        room_id = self._get_room_id(seed_hostel)
        response = client.delete(f'/rooms/{room_id}')
        assert response.status_code == 200
        assert response.get_json()['message'] == 'Room deleted successfully'

    def test_delete_room_not_found(self, client):
        """DELETE /rooms/<id> on missing room returns 404."""
        response = client.delete('/rooms/9999')
        assert response.status_code == 404

    def test_delete_room_with_occupants(self, client, seed_hostel):
        """DELETE /rooms/<id> is blocked when students are checked in."""
        from models import Room
        room_id = self._get_room_id(seed_hostel)

        with app.app_context():
            room = Room.query.get(room_id)
            room.current_occupancy = 1
            db.session.commit()

        response = client.delete(f'/rooms/{room_id}')
        assert response.status_code == 400
        assert 'checked in' in response.get_json()['error'].lower()