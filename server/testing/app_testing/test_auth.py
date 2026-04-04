import pytest
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import app, db
import app as app_routes  # Import to load routes


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
        print("Status Code: ", response.status_code)
        print(response.get_json())
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


class TestSignup:
    def test_student_signup_success(self, client):
        """POST /signup creates a new student account and returns a token."""
        response = client.post(
            '/signup',
            json={
                'full_name': 'Student One',
                'email': 'student1@example.com',
                'password': 'password123',
                'role': 'student'
            },
            content_type='application/json'
        )
        assert response.status_code == 201
        assert 'access_token' in response.get_json()

    def test_duplicate_signup_returns_400(self, client):
        """Signing up with an existing email is rejected."""
        client.post(
            '/signup',
            json={
                'full_name': 'Student One',
                'email': 'student1@example.com',
                'password': 'password123',
                'role': 'student'
            },
            content_type='application/json'
        )

        response = client.post(
            '/signup',
            json={
                'full_name': 'Student One',
                'email': 'student1@example.com',
                'password': 'password123',
                'role': 'student'
            },
            content_type='application/json'
        )
        assert response.status_code == 400
        assert response.get_json()['error'] == 'Email already registered'


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