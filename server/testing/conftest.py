"""
Pytest configuration for isolated test database setup.
Ensures production database is never modified during testing.
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))


@pytest.fixture(scope='function')
def app_with_test_db():
    """
    Create a Flask app instance with an isolated in-memory test database.
    This prevents any production data from being modified.
    """
    # Import AFTER path is set
    from config import app as base_app, db as base_db
    
    # Create a new app instance for testing
    test_app = base_app
    
    # Configure for testing BEFORE any db operations
    test_app.config['TESTING'] = True
    test_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    test_app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    with test_app.app_context():
        # Create all tables in the in-memory database
        base_db.create_all()
        yield test_app
        # Clean up: remove session and drop all tables from in-memory DB only
        base_db.session.remove()
        base_db.drop_all()


@pytest.fixture
def client(app_with_test_db):
    """Provide a test client connected to the isolated test database."""
    return app_with_test_db.test_client()


@pytest.fixture
def db(app_with_test_db):
    """Provide access to the test database."""
    from config import db as base_db
    return base_db
