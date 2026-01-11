from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    content: Dict[str, Any]

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    auto_clear_at: datetime
    
    class Config:
        from_attributes = True