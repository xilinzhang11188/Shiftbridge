from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # shift_request, shift_confirmed, worker_assigned, etc.
    content = Column(JSON, nullable=False)  # Flexible JSON content
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    auto_clear_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=3))
    
    # Relationships
    user = relationship("User", back_populates="notifications")