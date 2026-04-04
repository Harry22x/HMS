import pytest
from unittest.mock import patch
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # Import to load routes


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