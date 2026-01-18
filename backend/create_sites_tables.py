"""
Script to create the sites and contact_persons tables in the database
"""
from app.database import engine, Base
from app.models.site import Site, ContactPerson

print("Creating sites and contact_persons tables...")
Base.metadata.create_all(bind=engine, tables=[Site.__table__, ContactPerson.__table__])
print("Tables created successfully!")