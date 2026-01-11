from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    WORKER = "worker"
    ADMIN = "admin"

class LicenseType(str, enum.Enum):
    MEDICAL_PROVIDER = "Medical Provider"
    NURSE = "Nurse"
    MEDICAL_ASSISTANT = "Medical Assistant"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True)
    company_name = Column(String, nullable=False)
    requested_services = Column(ARRAY(Integer), default=[])  # Array of service IDs
    
    # Relationships
    sites = relationship("Site", back_populates="client", cascade="all, delete-orphan")
    shifts = relationship("Shift", back_populates="client", cascade="all, delete-orphan")

class Worker(Base):
    __tablename__ = "workers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True)
    license_type = Column(SQLEnum(LicenseType), nullable=False)
    licensed_states = Column(ARRAY(String), nullable=False)  # Array of state codes
    services_offered = Column(ARRAY(Integer), nullable=False)  # Array of service IDs
    
    # Relationships
    shift_claims = relationship("ShiftClaim", back_populates="worker", cascade="all, delete-orphan")
    assigned_shifts = relationship("Shift", back_populates="assigned_worker")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True)