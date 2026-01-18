from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.user import User, Client, Worker, UserRole
from app.models.shift import Shift, ShiftClaim, ShiftStatus, ClaimStatus
from app.models.site import Site
from app.schemas import (
    ShiftCreate, ShiftUpdate, ShiftResponse, ShiftDetailResponse,
    ShiftClaimCreate, ShiftClaimResponse, AssignWorkerRequest
)
from app.utils.auth import get_current_user, require_admin

router = APIRouter()

@router.get("/", response_model=List[ShiftResponse])
async def get_all_shifts(
    status_filter: Optional[ShiftStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all shifts (filtered by role)"""
    query = db.query(Shift)
    
    # Filter based on user role
    if current_user.role == UserRole.CLIENT:
        # Clients see only their own shifts
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if client:
            query = query.filter(Shift.client_id == client.id)
        else:
            return []
    elif current_user.role == UserRole.WORKER:
        # Workers see their assigned shifts
        worker = db.query(Worker).filter(Worker.user_id == current_user.id).first()
        if worker:
            query = query.filter(Shift.assigned_worker_id == worker.id)
        else:
            return []
    # Admin sees all shifts
    
    # Apply status filter if provided
    if status_filter:
        query = query.filter(Shift.status == status_filter)
    
    shifts = query.order_by(Shift.day, Shift.start_time).all()
    
    # Enrich shifts with client, site, and worker details
    enriched_shifts = []
    for shift in shifts:
        # Get client info
        client = db.query(Client).filter(Client.id == shift.client_id).first()
        client_user = db.query(User).filter(User.id == client.user_id).first() if client else None
        
        # Get site info
        site = db.query(Site).filter(Site.id == shift.site_id).first()
        
        # Get worker info if assigned
        worker_name = None
        if shift.assigned_worker_id:
            worker = db.query(Worker).filter(Worker.id == shift.assigned_worker_id).first()
            if worker:
                worker_user = db.query(User).filter(User.id == worker.user_id).first()
                worker_name = worker_user.name if worker_user else None
        
        enriched_shifts.append({
            **shift.__dict__,
            "client_name": client.company_name if client else None,
            "site_address": site.address if site else None,
            "assigned_worker_name": worker_name
        })
    
    return enriched_shifts

@router.get("/{shift_id}", response_model=ShiftDetailResponse)
async def get_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific shift with details"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.CLIENT:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or shift.client_id != client.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == UserRole.WORKER:
        worker = db.query(Worker).filter(Worker.user_id == current_user.id).first()
        if not worker or shift.assigned_worker_id != worker.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Get additional details
    client = db.query(Client).filter(Client.id == shift.client_id).first()
    client_user = db.query(User).filter(User.id == client.user_id).first() if client else None
    site = db.query(Site).filter(Site.id == shift.site_id).first()
    
    assigned_worker_name = None
    if shift.assigned_worker_id:
        worker = db.query(Worker).filter(Worker.id == shift.assigned_worker_id).first()
        if worker:
            worker_user = db.query(User).filter(User.id == worker.user_id).first()
            assigned_worker_name = worker_user.name if worker_user else None
    
    claimants_count = db.query(ShiftClaim).filter(
        ShiftClaim.shift_id == shift_id,
        ShiftClaim.status == ClaimStatus.PENDING
    ).count()
    
    return {
        **shift.__dict__,
        "client_name": client_user.name if client_user else None,
        "site_address": site.address if site else None,
        "assigned_worker_name": assigned_worker_name,
        "claimants_count": claimants_count
    }

@router.post("/", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
async def create_shift(
    shift_data: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new shift"""
    # Verify client exists
    client = db.query(Client).filter(Client.id == shift_data.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.CLIENT:
        client_profile = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client_profile or client_profile.id != shift_data.client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only create shifts for your own organization"
            )
        # Client requests start as REQUESTED status
        initial_status = ShiftStatus.REQUESTED
    elif current_user.role == UserRole.ADMIN:
        # Admin can create shifts directly as CONFIRMED
        initial_status = ShiftStatus.CONFIRMED
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Workers cannot create shifts"
        )
    
    # Verify site exists and belongs to client
    site = db.query(Site).filter(Site.id == shift_data.site_id).first()
    if not site or site.client_id != shift_data.client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid site for this client"
        )
    
    # Verify end time is after start time
    if shift_data.end_time <= shift_data.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )
    
    # Create shift
    shift = Shift(
        client_id=shift_data.client_id,
        site_id=shift_data.site_id,
        service_ids=shift_data.service_ids,
        day=shift_data.day,
        start_time=shift_data.start_time,
        end_time=shift_data.end_time,
        repeat_pattern=shift_data.repeat_pattern,
        status=initial_status,
        assigned_worker_id=shift_data.assigned_worker_id,
        created_by=current_user.id
    )
    
    db.add(shift)
    db.commit()
    db.refresh(shift)
    
    # TODO: Create notification for relevant parties
    
    return shift

@router.put("/{shift_id}", response_model=ShiftResponse)
async def update_shift(
    shift_id: int,
    shift_data: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a shift (Admin only)"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    # Update fields
    if shift_data.site_id is not None:
        # Verify site belongs to same client
        site = db.query(Site).filter(Site.id == shift_data.site_id).first()
        if not site or site.client_id != shift.client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid site for this client"
            )
        shift.site_id = shift_data.site_id
    
    if shift_data.service_ids is not None:
        shift.service_ids = shift_data.service_ids
    if shift_data.day is not None:
        shift.day = shift_data.day
    if shift_data.start_time is not None:
        shift.start_time = shift_data.start_time
    if shift_data.end_time is not None:
        shift.end_time = shift_data.end_time
    if shift_data.repeat_pattern is not None:
        shift.repeat_pattern = shift_data.repeat_pattern
    if shift_data.status is not None:
        shift.status = shift_data.status
    if shift_data.assigned_worker_id is not None:
        shift.assigned_worker_id = shift_data.assigned_worker_id
    
    shift.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(shift)
    
    return shift

@router.delete("/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a shift"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    # Check permissions
    can_cancel = False
    if current_user.role == UserRole.ADMIN:
        can_cancel = True
    elif current_user.role == UserRole.CLIENT:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if client and shift.client_id == client.id:
            can_cancel = True
    
    if not can_cancel:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update status to cancelled instead of deleting
    shift.status = ShiftStatus.CANCELLED
    shift.updated_at = datetime.utcnow()
    db.commit()
    
    # TODO: Create notifications for affected parties
    
    return None

@router.post("/{shift_id}/claim", response_model=ShiftClaimResponse, status_code=status.HTTP_201_CREATED)
async def claim_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Worker claims a shift"""
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can claim shifts"
        )
    
    worker = db.query(Worker).filter(Worker.user_id == current_user.id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )
    
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    # Check if shift is available for claiming
    if shift.status != ShiftStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shift is not available for claiming"
        )
    
    if shift.assigned_worker_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shift is already assigned"
        )
    
    # Check if worker already claimed this shift
    existing_claim = db.query(ShiftClaim).filter(
        ShiftClaim.shift_id == shift_id,
        ShiftClaim.worker_id == worker.id
    ).first()
    
    if existing_claim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already claimed this shift"
        )
    
    # TODO: Check eligibility (distance, license, service)
    
    # Create claim
    claim = ShiftClaim(
        shift_id=shift_id,
        worker_id=worker.id,
        status=ClaimStatus.PENDING
    )
    
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    # TODO: Create notification for admin
    
    return {
        "id": claim.id,
        "shift_id": claim.shift_id,
        "worker_id": claim.worker_id,
        "status": claim.status,
        "claimed_at": claim.claimed_at,
        "worker_name": current_user.name
    }

@router.get("/{shift_id}/claimants", response_model=List[ShiftClaimResponse])
async def get_shift_claimants(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all claimants for a shift (Admin only)"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    claims = db.query(ShiftClaim).filter(
        ShiftClaim.shift_id == shift_id,
        ShiftClaim.status == ClaimStatus.PENDING
    ).all()
    
    result = []
    for claim in claims:
        worker = db.query(Worker).filter(Worker.id == claim.worker_id).first()
        worker_user = db.query(User).filter(User.id == worker.user_id).first() if worker else None
        
        result.append({
            "id": claim.id,
            "shift_id": claim.shift_id,
            "worker_id": claim.worker_id,
            "status": claim.status,
            "claimed_at": claim.claimed_at,
            "worker_name": worker_user.name if worker_user else None
        })
    
    return result

@router.post("/{shift_id}/assign", response_model=ShiftResponse)
async def assign_worker_to_shift(
    shift_id: int,
    assignment: AssignWorkerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Assign a worker to a shift (Admin only)"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    worker = db.query(Worker).filter(Worker.id == assignment.worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    # Check if worker claimed this shift
    claim = db.query(ShiftClaim).filter(
        ShiftClaim.shift_id == shift_id,
        ShiftClaim.worker_id == assignment.worker_id,
        ShiftClaim.status == ClaimStatus.PENDING
    ).first()
    
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker has not claimed this shift"
        )
    
    # Assign worker to shift
    shift.assigned_worker_id = assignment.worker_id
    shift.status = ShiftStatus.ASSIGNED
    shift.updated_at = datetime.utcnow()
    
    # Update claim status
    claim.status = ClaimStatus.ACCEPTED
    
    # Reject other claims
    other_claims = db.query(ShiftClaim).filter(
        ShiftClaim.shift_id == shift_id,
        ShiftClaim.worker_id != assignment.worker_id,
        ShiftClaim.status == ClaimStatus.PENDING
    ).all()
    
    for other_claim in other_claims:
        other_claim.status = ClaimStatus.REJECTED
    
    db.commit()
    db.refresh(shift)
    
    # TODO: Create notifications for assigned worker and rejected claimants
    
    return shift

@router.post("/{shift_id}/invite-workers")
async def invite_workers_to_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Notify eligible workers about a shift (Admin only)"""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    if shift.assigned_worker_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shift is already assigned"
        )
    
    # TODO: Calculate eligible workers and send notifications
    # This will be implemented when we add the eligibility matching service
    
    return {"message": "Worker invitations sent (to be implemented)"}