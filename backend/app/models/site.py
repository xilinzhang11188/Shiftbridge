from sqlalchemy import Column, Integer, String, Float, ARRAY, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    services_available = Column(ARRAY(Integer), default=[])
    
    # Relationships
    client = relationship("Client", back_populates="sites")
    contact_persons = relationship("ContactPerson", back_populates="site", cascade="all, delete-orphan")
    shifts = relationship("Shift", back_populates="site", cascade="all, delete-orphan")

class ContactPerson(Base):
    __tablename__ = "contact_persons"
    
    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    
    # Relationships
    site = relationship("Site", back_populates="contact_persons")