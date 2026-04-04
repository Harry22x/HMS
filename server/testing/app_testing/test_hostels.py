import pytest
import json
from unittest.mock import patch
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # Import to load routes


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
        assert hostels[0]['hostel_name'] == 'Test Hostel'

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


class TestSearchHostel:
    def test_search_hostels_returns_location_and_name(self, client, seed_hostel):
        """GET /hostels returns hostel list with name and coordinates."""
        response = client.get('/hostels')
        assert response.status_code == 200
        hostels = response.get_json()
        assert len(hostels) == 1
        assert hostels[0]['hostel_name'] == 'Test Hostel'
        assert 'latitude' in hostels[0]
        assert 'longitude' in hostels[0]

    def test_hostel_details_includes_coordinates(self, client, seed_hostel):
        """GET /hostels/<id> returns latitude and longitude for the hostel."""
        response = client.get(f'/hostels/{seed_hostel}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['latitude'] == -1.29
        assert data['longitude'] == 36.82


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


class TestAdminHostelStatus:
    def test_admin_can_approve_hostel_listing(self, client, seed_hostel):
        """PATCH /hostels/<id> with admin role changes status to approved."""
        response = client.patch(
            f'/hostels/{seed_hostel}',
            json={'status': 'approved', 'current_user_role': 'admin'}
        )
        assert response.status_code == 200
        assert response.get_json()['status'] == 'approved'

    def test_admin_can_suspend_hostel_listing(self, client, seed_hostel):
        """PATCH /hostels/<id> with admin role changes status to suspended."""
        response = client.patch(
            f'/hostels/{seed_hostel}',
            json={'status': 'suspended', 'current_user_role': 'admin'}
        )
        assert response.status_code == 200
        assert response.get_json()['status'] == 'suspended'