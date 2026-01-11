from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.service import Service
from app.models.user import Client
from app.schemas import ServiceCreate, ServiceUpdate, ServiceResponse, AssignClientsRequest
from app.utils.auth import get_current_user, require_admin

router = APIRouter()

@router.get("/", response_model=List[ServiceResponse])
async def get_all_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all services"""
    services = db.query(Service).all()
    return services

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific service"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new service (Admin only)"""
    # Check if service name already exists
    existing_service = db.query(Service).filter(Service.name == service_data.name).first()
    if existing_service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service with this name already exists"
        )
    
    service = Service(
        name=service_data.name,
        description=service_data.description,
        created_by=current_user.id
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a service (Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check if new name conflicts with existing service
    if service_data.name and service_data.name != service.name:
        existing_service = db.query(Service).filter(Service.name == service_data.name).first()
        if existing_service:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service with this name already exists"
            )
    
    # Update fields
    if service_data.name is not None:
        service.name = service_data.name
    if service_data.description is not None:
        service.description = service_data.description
    
    db.commit()
    db.refresh(service)
    
    return service

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a service (Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    db.delete(service)
    db.commit()
    
    return None

@router.post("/{service_id}/assign-clients")
async def assign_service_to_clients(
    service_id: int,
    assignment_data: AssignClientsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Assign service to specific clients or all clients (Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if assignment_data.open_to_all:
        # Add service to all clients
        clients = db.query(Client).all()
        for client in clients:
            if service_id not in client.requested_services:
                client.requested_services = client.requested_services + [service_id]
        db.commit()
        return {"message": f"Service assigned to all {len(clients)} clients"}
    else:
        # Add service to specific clients
        assigned_count = 0
        for client_id in assignment_data.client_ids:
            client = db.query(Client).filter(Client.id == client_id).first()
            if client:
                if service_id not in client.requested_services:
                    client.requested_services = client.requested_services + [service_id]
                    assigned_count += 1
        db.commit()
        return {"message": f"Service assigned to {assigned_count} clients"}