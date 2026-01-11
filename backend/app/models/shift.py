from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Enum as SQLEnum, ARRAY, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class ShiftStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    ASSIGNED = "assigned"
    CANCELLED = "cancelled"

class ClaimStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    service_ids = Column(ARRAY(Integer), nullable=False)
    day = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    repeat_pattern = Column(String, nullable=True)
    status = Column(SQLEnum(ShiftStatus), default=ShiftStatus.REQUESTED)
    assigned_worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="shifts")
    site = relationship("Site", back_populates="shifts")
    assigned_worker = relationship("Worker", back_populates="assigned_shifts")
    shift_claims = relationship("ShiftClaim", back_populates="shift", cascade="all, delete-orphan")

class ShiftClaim(Base):
    __tablename__ = "shift_claims"
    
    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.PENDING)
    claimed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    shift = relationship("Shift", back_populates="shift_claims")
    worker = relationship("Worker", back_populates="shift_claims")