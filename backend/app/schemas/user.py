from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.user import UserRole, LicenseType

# Base User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    address: str
    phone: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole

class UserUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Client Schemas
class ClientCreate(UserCreate):
    company_name: str
    requested_services: List[int] = []
    role: UserRole = UserRole.CLIENT

class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    requested_services: Optional[List[int]] = None
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    requested_services: List[int]
    user: UserResponse
    sites: Optional[List[Any]] = []
    
    class Config:
        from_attributes = True

# Worker Schemas
class WorkerCreate(UserCreate):
    license_type: LicenseType
    licensed_states: List[str] = Field(..., min_items=1)
    services_offered: List[int] = Field(..., min_items=1)
    role: UserRole = UserRole.WORKER

class WorkerUpdate(BaseModel):
    license_type: Optional[LicenseType] = None
    licensed_states: Optional[List[str]] = None
    services_offered: Optional[List[int]] = None
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class WorkerResponse(BaseModel):
    id: int
    user_id: int
    license_type: LicenseType
    licensed_states: List[str]
    services_offered: List[int]
    user: UserResponse
    
    class Config:
        from_attributes = True

# Admin Schemas
class AdminCreate(UserCreate):
    role: UserRole = UserRole.ADMIN

class AdminResponse(BaseModel):
    id: int
    user_id: int
    user: UserResponse
    
    class Config:
        from_attributes = True