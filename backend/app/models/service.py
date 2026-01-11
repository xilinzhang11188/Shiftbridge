from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    created_by = Column(Integer, nullable=False)  # admin_id
    created_at = Column(DateTime, default=datetime.utcnow)