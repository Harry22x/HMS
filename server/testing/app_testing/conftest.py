"""
Pytest configuration for isolated test database setup.
Ensures production database is never modified during testing.
"""
import pytest
import sys
import os

# Set testing environment variable before importing config so that in-memory DB is used
os.environ['TESTING'] = 'True'

# Add server directory to path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

# Now import Flask and config
from config import app, db


@pytest.fixture(scope='function')
def client():
    """
    Provide a test client with an isolated in-memory SQLite database.
    Each test gets a fresh database that is destroyed after the test.
    """
    # Configure app for testing
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    with app.app_context():
        # Create all tables in the in-memory database
        db.create_all()
        
        # Yield the test client
        yield app.test_client()
        
        # Cleanup: drop all tables after test completes
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
    from models import Hostel, Room, User

    with app.app_context():
        manager = User(
            full_name='Hostel Manager',
            email='hostel_manager@example.com',
            role='manager'
        )
        manager.password_hash = 'password123'
        db.session.add(manager)
        db.session.flush()

        hostel = Hostel(
            hostel_name='Test Hostel',
            description='A cozy place',
            images='https://example.com/hostel.jpg',
            manager_id=manager.id,
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
