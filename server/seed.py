from config import app, db, bcrypt
from models import User, Hostel, Room
from datetime import datetime

def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        Room.query.delete()
        Hostel.query.delete()
        User.query.delete()

        print("Creating managers...")
        m1 = User(full_name="Alice Johnson", email="alice@hostel.com", role="manager")
        m1.password_hash = "password123"
        
        m2 = User(full_name="Bob Smith", email="bob@hostel.com", role="manager")
        m2.password_hash = "password123"

        db.session.add_all([m1, m2])
        db.session.commit()

        print("Seeding hostels and rooms...")
        hostel_info = [
            {"name": "University Heights", "mgr": m1, "img": "https://i.gzn.jp/img/2014/03/21/oxford-university-student-hall/top.jpg"},
            {"name": "Central Residence", "mgr": m1, "img": "https://images.unsplash.com/photo-1564273795917-fe399b763988?q=80&w=1000"},
            {"name": "Eastside Dorm", "mgr": m2, "img": "https://images.unsplash.com/photo-1539606420556-14c457c45507?q=80&w=1000"},
            {"name": "Westwood Hall", "mgr": m2, "img": "https://images.unsplash.com/photo-1689090348341-a5936ec7e79e?q=80&w=1000"},
        ]

        
        room_templates = [
            {
                "type": "Premium",
                "capacity": 1,
                "price": 25000.0,
                "occ": 0, 
                "desc": "Single occupant luxury suite with private study desk and en-suite bathroom.",
                "img": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800"
            },
            {
                "type": "Twin",
                "capacity": 2,
                "price": 20000.0,
                "occ": 2, 
                "desc": "Comfortable shared room for two with partitioned workspaces and shared storage.",
                "img": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800"
            },
            {
                "type": "Economy",
                "capacity": 3,
                "price": 13500.0,
                "occ": 2, 
                "desc": "Affordable triple-share room featuring bunk beds and high-speed WiFi access.",
                "img": "https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800"
            }
        ]

        for h_data in hostel_info:
           
            h = Hostel(
                hostel_name=h_data["name"],
                location_coordinates=-1.2921, 
                description=f"Top-tier student living at {h_data['name']}.",
                images=h_data["img"],
                amenities="WiFi, Laundry, Security",
                status="active",
                manager_id=h_data["mgr"].id
            )
            db.session.add(h)
            db.session.flush() 

           
            for r_temp in room_templates:
                room = Room(
                    room_type=r_temp["type"],
                    capacity=r_temp["capacity"],
                    current_occupancy=r_temp["occ"],
                    price=r_temp["price"],
                    description=r_temp["desc"],
                    images=r_temp["img"],
                    hostel_id=h.id
                )
                db.session.add(room)

        db.session.commit()
        print("Database seeded with hostels and specialized rooms!")

if __name__ == '__main__':
    seed_database()