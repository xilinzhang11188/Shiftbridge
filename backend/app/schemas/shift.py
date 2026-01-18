from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime
from app.models.shift import ShiftStatus, ClaimStatus

# Shift Schemas
class ShiftBase(BaseModel):
    client_id: int
    site_id: int
    service_ids: List[int] = Field(..., min_items=1)
    day: date
    start_time: time
    end_time: time
    repeat_pattern: Optional[str] = None

class ShiftCreate(ShiftBase):
    assigned_worker_id: Optional[int] = None

class ShiftUpdate(BaseModel):
    site_id: Optional[int] = None
    service_ids: Optional[List[int]] = None
    day: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    repeat_pattern: Optional[str] = None
    status: Optional[ShiftStatus] = None
    assigned_worker_id: Optional[int] = None

class ShiftResponse(ShiftBase):
    id: int
    status: ShiftStatus
    assigned_worker_id: Optional[int] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    client_name: Optional[str] = None
    site_address: Optional[str] = None
    assigned_worker_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ShiftDetailResponse(ShiftResponse):
    client_name: Optional[str] = None
    site_address: Optional[str] = None
    assigned_worker_name: Optional[str] = None
    claimants_count: int = 0

# Shift Claim Schemas
class ShiftClaimCreate(BaseModel):
    shift_id: int

class ShiftClaimResponse(BaseModel):
    id: int
    shift_id: int
    worker_id: int
    status: ClaimStatus
    claimed_at: datetime
    worker_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class AssignWorkerRequest(BaseModel):
    worker_id: int