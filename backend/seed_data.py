"""
Seed script to populate the database with sample data for testing
Run with: python seed_data.py
"""
from datetime import date, time, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User, Client, Worker, Admin, UserRole, LicenseType
from app.models.service import Service
from app.models.site import Site, ContactPerson
from app.models.shift import Shift, ShiftStatus
from app.utils.auth import get_password_hash

def seed_database():
    """Seed the database with sample data"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        db.query(Shift).delete()
        db.query(ContactPerson).delete()
        db.query(Site).delete()
        db.query(Worker).delete()
        db.query(Client).delete()
        db.query(Admin).delete()
        db.query(Service).delete()
        db.query(User).delete()
        db.commit()
        
        print("Creating admin user...")
        # Create admin user
        admin_user = User(
            email="admin@shiftbridge.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            name="Admin User",
            address="123 Admin St, New York, NY 10001",
            phone="555-0100"
        )
        db.add(admin_user)
        db.flush()
        
        admin = Admin(user_id=admin_user.id)
        db.add(admin)
        db.commit()
        print(f"✓ Admin created: {admin_user.email}")
        
        print("\nCreating services...")
        # Create services
        services = [
            Service(name="Medical Provider", description="Licensed medical provider services", created_by=admin_user.id),
            Service(name="Nursing", description="Registered nurse services", created_by=admin_user.id),
            Service(name="Medical Assistant", description="Medical assistant services", created_by=admin_user.id),
            Service(name="Lab Work", description="Laboratory services", created_by=admin_user.id),
            Service(name="Patient Care", description="General patient care", created_by=admin_user.id),
        ]
        for service in services:
            db.add(service)
        db.commit()
        print(f"✓ Created {len(services)} services")
        
        print("\nCreating client users...")
        # Create client users
        client1_user = User(
            email="client1@healthclinic.com",
            hashed_password=get_password_hash("client123"),
            role=UserRole.CLIENT,
            name="Sarah Johnson",
            address="456 Healthcare Ave, Boston, MA 02101",
            phone="555-0201"
        )
        db.add(client1_user)
        db.flush()
        
        client1 = Client(
            user_id=client1_user.id,
            company_name="Boston Health Clinic",
            requested_services=[1, 2, 3]  # Medical Provider, Nursing, Medical Assistant
        )
        db.add(client1)
        db.commit()
        print(f"✓ Client created: {client1.company_name}")
        
        client2_user = User(
            email="client2@medcenter.com",
            hashed_password=get_password_hash("client123"),
            role=UserRole.CLIENT,
            name="Michael Chen",
            address="789 Medical Blvd, New York, NY 10002",
            phone="555-0202"
        )
        db.add(client2_user)
        db.flush()
        
        client2 = Client(
            user_id=client2_user.id,
            company_name="NYC Medical Center",
            requested_services=[1, 2, 4, 5]  # Medical Provider, Nursing, Lab Work, Patient Care
        )
        db.add(client2)
        db.commit()
        print(f"✓ Client created: {client2.company_name}")
        
        print("\nCreating sites for clients...")
        # Create sites for client 1
        site1 = Site(
            client_id=client1.id,
            address="456 Healthcare Ave, Boston, MA 02101",
            latitude=42.3601,
            longitude=-71.0589,
            services_available=[1, 2, 3]
        )
        db.add(site1)
        db.flush()
        
        contact1 = ContactPerson(
            site_id=site1.id,
            name="Jane Smith",
            email="jane@healthclinic.com",
            phone="555-0301"
        )
        db.add(contact1)
        
        site2 = Site(
            client_id=client1.id,
            address="100 Wellness Dr, Cambridge, MA 02138",
            latitude=42.3736,
            longitude=-71.1097,
            services_available=[2, 3]
        )
        db.add(site2)
        db.flush()
        
        contact2 = ContactPerson(
            site_id=site2.id,
            name="Robert Brown",
            email="robert@healthclinic.com",
            phone="555-0302"
        )
        db.add(contact2)
        
        # Create sites for client 2
        site3 = Site(
            client_id=client2.id,
            address="789 Medical Blvd, New York, NY 10002",
            latitude=40.7128,
            longitude=-74.0060,
            services_available=[1, 2, 4, 5]
        )
        db.add(site3)
        db.flush()
        
        contact3 = ContactPerson(
            site_id=site3.id,
            name="Emily Davis",
            email="emily@medcenter.com",
            phone="555-0303"
        )
        db.add(contact3)
        
        db.commit()
        print(f"✓ Created 3 sites with contact persons")
        
        print("\nCreating worker users...")
        # Create worker users
        worker1_user = User(
            email="worker1@example.com",
            hashed_password=get_password_hash("worker123"),
            role=UserRole.WORKER,
            name="Dr. Marcus Williams",
            address="200 Elm St, Boston, MA 02115",
            phone="555-0401"
        )
        db.add(worker1_user)
        db.flush()
        
        worker1 = Worker(
            user_id=worker1_user.id,
            license_type=LicenseType.MEDICAL_PROVIDER,
            licensed_states=["MA", "NY", "CT"],
            services_offered=[1, 5]  # Medical Provider, Patient Care
        )
        db.add(worker1)
        
        worker2_user = User(
            email="worker2@example.com",
            hashed_password=get_password_hash("worker123"),
            role=UserRole.WORKER,
            name="Lisa Anderson RN",
            address="300 Oak Ave, Cambridge, MA 02139",
            phone="555-0402"
        )
        db.add(worker2_user)
        db.flush()
        
        worker2 = Worker(
            user_id=worker2_user.id,
            license_type=LicenseType.NURSE,
            licensed_states=["MA", "NH"],
            services_offered=[2, 5]  # Nursing, Patient Care
        )
        db.add(worker2)
        
        worker3_user = User(
            email="worker3@example.com",
            hashed_password=get_password_hash("worker123"),
            role=UserRole.WORKER,
            name="James Martinez",
            address="400 Pine Rd, New York, NY 10003",
            phone="555-0403"
        )
        db.add(worker3_user)
        db.flush()
        
        worker3 = Worker(
            user_id=worker3_user.id,
            license_type=LicenseType.MEDICAL_ASSISTANT,
            licensed_states=["NY", "NJ"],
            services_offered=[3, 4]  # Medical Assistant, Lab Work
        )
        db.add(worker3)
        
        db.commit()
        print(f"✓ Created 3 workers")
        
        print("\nCreating sample shifts...")
        # Create sample shifts
        today = date.today()
        
        shift1 = Shift(
            client_id=client1.id,
            site_id=site1.id,
            service_ids=[1],
            day=today + timedelta(days=7),
            start_time=time(9, 0),
            end_time=time(17, 0),
            status=ShiftStatus.CONFIRMED,
            created_by=admin_user.id
        )
        db.add(shift1)
        
        shift2 = Shift(
            client_id=client1.id,
            site_id=site2.id,
            service_ids=[2],
            day=today + timedelta(days=8),
            start_time=time(8, 0),
            end_time=time(16, 0),
            status=ShiftStatus.CONFIRMED,
            created_by=admin_user.id
        )
        db.add(shift2)
        
        shift3 = Shift(
            client_id=client2.id,
            site_id=site3.id,
            service_ids=[1, 5],
            day=today + timedelta(days=10),
            start_time=time(10, 0),
            end_time=time(18, 0),
            status=ShiftStatus.REQUESTED,
            created_by=client2_user.id
        )
        db.add(shift3)
        
        db.commit()
        print(f"✓ Created 3 sample shifts")
        
        print("\n" + "="*50)
        print("Database seeded successfully!")
        print("="*50)
        print("\nTest Accounts:")
        print("-" * 50)
        print("Admin:")
        print("  Email: admin@shiftbridge.com")
        print("  Password: admin123")
        print("\nClient 1 (Boston Health Clinic):")
        print("  Email: client1@healthclinic.com")
        print("  Password: client123")
        print("\nClient 2 (NYC Medical Center):")
        print("  Email: client2@medcenter.com")
        print("  Password: client123")
        print("\nWorker 1 (Medical Provider):")
        print("  Email: worker1@example.com")
        print("  Password: worker123")
        print("\nWorker 2 (Nurse):")
        print("  Email: worker2@example.com")
        print("  Password: worker123")
        print("\nWorker 3 (Medical Assistant):")
        print("  Email: worker3@example.com")
        print("  Password: worker123")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_database()