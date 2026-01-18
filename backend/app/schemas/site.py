from pydantic import BaseModel
from typing import Optional, List

# Site Schemas
class SiteBase(BaseModel):
    address: str
    services_available: List[int] = []

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    address: Optional[str] = None
    services_available: Optional[List[int]] = None

class SiteResponse(SiteBase):
    id: int
    client_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    class Config:
        from_attributes = True

# Contact Person Schemas
class ContactPersonBase(BaseModel):
    name: str
    email: str
    phone: str

class ContactPersonCreate(ContactPersonBase):
    site_id: int

class ContactPersonUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ContactPersonResponse(ContactPersonBase):
    id: int
    site_id: int
    
    class Config:
        from_attributes = True