from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, Worker, UserRole
from app.models.shift import Shift, ShiftStatus
from app.schemas import WorkerResponse, WorkerUpdate, ShiftResponse
from app.utils.auth import get_current_user, require_admin

router = APIRouter()

@router.get("/", response_model=List[WorkerResponse])
async def get_all_workers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all workers (Admin only)"""
    workers = db.query(Worker).all()
    
    # Fetch user data for each worker
    result = []
    for worker in workers:
        user = db.query(User).filter(User.id == worker.user_id).first()
        worker_dict = {
            "id": worker.id,
            "user_id": worker.user_id,
            "license_type": worker.license_type,
            "licensed_states": worker.licensed_states,
            "services_offered": worker.services_offered,
            "user": user
        }
        result.append(worker_dict)
    
    return result

@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific worker"""
    # Admin can view any worker, workers can only view themselves
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and worker.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    user = db.query(User).filter(User.id == worker.user_id).first()
    return {
        "id": worker.id,
        "user_id": worker.user_id,
        "license_type": worker.license_type,
        "licensed_states": worker.licensed_states,
        "services_offered": worker.services_offered,
        "user": user
    }

@router.put("/{worker_id}", response_model=WorkerResponse)
async def update_worker(
    worker_id: int,
    worker_data: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a worker"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and worker.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update worker fields
    if worker_data.license_type is not None:
        worker.license_type = worker_data.license_type
    if worker_data.licensed_states is not None:
        worker.licensed_states = worker_data.licensed_states
    if worker_data.services_offered is not None:
        worker.services_offered = worker_data.services_offered
    
    # Update user fields
    user = db.query(User).filter(User.id == worker.user_id).first()
    if worker_data.name is not None:
        user.name = worker_data.name
    if worker_data.address is not None:
        user.address = worker_data.address
    if worker_data.phone is not None:
        user.phone = worker_data.phone
    
    db.commit()
    db.refresh(worker)
    db.refresh(user)
    
    return {
        "id": worker.id,
        "user_id": worker.user_id,
        "license_type": worker.license_type,
        "licensed_states": worker.licensed_states,
        "services_offered": worker.services_offered,
        "user": user
    }

@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a worker (Admin only)"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    # Delete associated user
    user = db.query(User).filter(User.id == worker.user_id).first()
    if user:
        db.delete(user)
    
    db.delete(worker)
    db.commit()
    
    return None

@router.get("/{worker_id}/shifts", response_model=List[ShiftResponse])
async def get_worker_shifts(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all shifts assigned to a worker"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and worker.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    shifts = db.query(Shift).filter(
        Shift.assigned_worker_id == worker_id,
        Shift.status.in_([ShiftStatus.ASSIGNED, ShiftStatus.CONFIRMED])
    ).order_by(Shift.day, Shift.start_time).all()
    
    return shifts

@router.get("/{worker_id}/available-shifts", response_model=List[ShiftResponse])
async def get_available_shifts(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available shifts that a worker is eligible for"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and worker.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all confirmed shifts without assigned workers
    available_shifts = db.query(Shift).filter(
        Shift.status == ShiftStatus.CONFIRMED,
        Shift.assigned_worker_id == None
    ).all()
    
    # TODO: Filter by eligibility (distance, license, service)
    # This will be implemented when we add the eligibility matching service
    
    return available_shifts