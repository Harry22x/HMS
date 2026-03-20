from config import app, db, bcrypt
from models import User, Hostel
import json

def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        Hostel.query.delete()
        User.query.delete()

        print("Creating managers...")
        # Create a couple of manager users
        m1 = User(
            full_name="Alice Johnson",
            email="alice@hostel.com",
            role="manager"
        )
        m1.password_hash = "password123" # This triggers the setter & bcrypt

        m2 = User(
            full_name="Bob Smith",
            email="bob@hostel.com",
            role="manager"
        )
        m2.password_hash = "password123"

        db.session.add_all([m1, m2])
        db.session.commit() # Commit to get their IDs

        print("Seeding hostels...")
        hostel_data = [
            {
                "name": 'University Heights Hostel',
                "location": 'Campus North, Block A',
                "amenities": ['WiFi', 'Parking', 'Cafeteria', 'Laundry'],
                "image": 'https://images.unsplash.com/photo-1552933440-440952890413?q=80&w=1080',
                "description": 'Modern hostel facilities with excellent amenities',
                "manager": m1
            },
            {
                "name": 'Central Student Residence',
                "location": 'Main Campus, Building 5',
                "amenities": ['WiFi', 'Study Room', 'Gym'],
                "image": 'https://images.unsplash.com/photo-1564273795917-fe399b763988?q=80&w=1080',
                "description": 'Comfortable rooms in a central location',
                "manager": m1
            },
            {
                "name": 'Eastside Dormitory',
                "location": 'East Campus, Tower 2',
                "amenities": ['WiFi', 'Parking', 'Security', 'Common Room'],
                "image": 'https://images.unsplash.com/photo-1539606420556-14c457c45507?q=80&w=1080',
                "description": 'Spacious accommodation with modern facilities',
                "manager": m2
            },
            {
                "name": 'Westwood Hall',
                "location": 'West Campus, Block C',
                "amenities": ['WiFi', 'Cafeteria', 'Library Access'],
                "image": 'https://images.unsplash.com/photo-1689090348341-a5936ec7e79e?q=80&w=1080',
                "description": 'Quiet and peaceful environment for students',
                "manager": m2
            }
        ]

        for h in hostel_data:
            new_hostel = Hostel(
                hostel_name=h["name"],
                # Using 0.0 as placeholder for coordinates from your model
                location_coordinates=0.0, 
                description=h["description"],
                images=h["image"],
                # Join amenities list into a string for the DB
                amenities=", ".join(h["amenities"]),
                status="active",
                manager_id=h["manager"].id
            )
            db.session.add(new_hostel)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()