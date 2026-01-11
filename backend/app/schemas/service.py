from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ServiceResponse(ServiceBase):
    id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AssignClientsRequest(BaseModel):
    client_ids: List[int]
    open_to_all: bool = False