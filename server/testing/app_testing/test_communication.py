import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # Import to load routes


class TestMessagesRoutes:
    def test_send_query_creates_message(self, client):
        """POST /messages stores a student query message."""
        from models import User

        with app.app_context():
            sender = User(full_name='query student', email='query@example.com', role='student')
            sender.password_hash = 'password123'
            receiver = User(full_name='manager one', email='manager@example.com', role='manager')
            receiver.password_hash = 'password123'
            db.session.add_all([sender, receiver])
            db.session.commit()
            sender_id = sender.id
            receiver_id = receiver.id

        response = client.post(
            '/messages',
            json={
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': 'I have a problem with my booking.'
            },
            content_type='application/json'
        )
        assert response.status_code == 201
        assert response.get_json()['content'] == 'I have a problem with my booking.'

    def test_manager_reply_to_query(self, client):
        """POST /messages allows the manager to reply to a student."""
        from models import User

        with app.app_context():
            student = User(full_name='reply student', email='reply_student@example.com', role='student')
            student.password_hash = 'password123'
            manager = User(full_name='reply manager', email='reply_manager@example.com', role='manager')
            manager.password_hash = 'password123'
            db.session.add_all([student, manager])
            db.session.commit()
            student_id = student.id
            manager_id = manager.id

        response = client.post(
            '/messages',
            json={
                'sender_id': manager_id,
                'receiver_id': student_id,
                'content': 'Please provide your booking details.'
            },
            content_type='application/json'
        )
        assert response.status_code == 201
        assert response.get_json()['sender_id'] == manager_id


class TestAnnouncementsRoutes:
    def test_manager_posts_announcement_success(self, client):
        """POST /announcements lets a manager post an announcement."""
        from models import User, Hostel

        with app.app_context():
            manager = User(full_name='announce manager', email='announce_manager@example.com', role='manager')
            manager.password_hash = 'password123'
            db.session.add(manager)
            db.session.flush()
            hostel = Hostel(
                hostel_name='Manager Hostel',
                description='A manager hostel',
                images='https://example.com/image.jpg',
                manager_id=manager.id,
                longitude=36.82,
                latitude=-1.29,
                amenities='WiFi',
                status='active'
            )
            db.session.add(hostel)
            db.session.commit()
            manager_id = manager.id
            hostel_id = hostel.id

        response = client.post(
            '/announcements',
            json={
                'sender_id': manager_id,
                'hostel_id': hostel_id,
                'content': 'New cleaning schedule posted.'
            },
            content_type='application/json'
        )
        assert response.status_code == 201
        assert response.get_json()['content'] == 'New cleaning schedule posted.'

    def test_view_hostel_announcements(self, client):
        """GET /hostels/<id>/announcements returns announcements for one hostel."""
        from models import User, Hostel, Announcement

        with app.app_context():
            manager = User(full_name='announce manager', email='announce_manager2@example.com', role='manager')
            manager.password_hash = 'password123'
            db.session.add(manager)
            db.session.flush()
            hostel = Hostel(
                hostel_name='Manager Hostel 2',
                description='A manager hostel 2',
                images='https://example.com/image2.jpg',
                manager_id=manager.id,
                longitude=36.82,
                latitude=-1.29,
                amenities='WiFi',
                status='active'
            )
            db.session.add(hostel)
            db.session.flush()
            announcement = Announcement(
                sender_id=manager.id,
                hostel_id=hostel.id,
                content='Hostel inspection tomorrow.'
            )
            db.session.add(announcement)
            db.session.commit()
            hostel_id = hostel.id

        response = client.get(f'/hostels/{hostel_id}/announcements')
        assert response.status_code == 200
        announcements = response.get_json()
        assert len(announcements) == 1
        assert announcements[0]['content'] == 'Hostel inspection tomorrow.'