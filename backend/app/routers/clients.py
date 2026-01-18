from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, Client, UserRole
from app.models.site import Site, ContactPerson
from app.schemas import (
    ClientResponse, ClientUpdate,
    SiteCreate, SiteUpdate, SiteResponse,
    ContactPersonCreate, ContactPersonUpdate, ContactPersonResponse
)
from app.utils.auth import get_current_user, require_admin

router = APIRouter()

# Client endpoints
@router.get("/", response_model=List[ClientResponse])
async def get_all_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all clients (Admin only)"""
    clients = db.query(Client).all()
    
    # Fetch user data for each client
    result = []
    for client in clients:
        user = db.query(User).filter(User.id == client.user_id).first()
        sites = db.query(Site).filter(Site.client_id == client.id).all()
        
        # Convert sites to dictionaries for proper JSON serialization
        sites_list = [
            {
                "id": site.id,
                "address": site.address,
                "client_id": site.client_id,
                "latitude": site.latitude,
                "longitude": site.longitude,
                "services_available": site.services_available
            }
            for site in sites
        ]
        
        client_dict = {
            "id": client.id,
            "user_id": client.user_id,
            "company_name": client.company_name,
            "requested_services": client.requested_services,
            "user": user,
            "sites": sites_list
        }
        result.append(client_dict)
    
    return result

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific client"""
    # Admin can view any client, clients can only view themselves
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    user = db.query(User).filter(User.id == client.user_id).first()
    sites = db.query(Site).filter(Site.client_id == client_id).all()
    
    # Convert sites to dictionaries for proper JSON serialization
    sites_list = [
        {
            "id": site.id,
            "address": site.address,
            "client_id": site.client_id,
            "latitude": site.latitude,
            "longitude": site.longitude,
            "services_available": site.services_available
        }
        for site in sites
    ]
    
    result = {
        "id": client.id,
        "user_id": client.user_id,
        "company_name": client.company_name,
        "requested_services": client.requested_services,
        "user": user,
        "sites": sites_list
    }
    return result

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update client fields
    if client_data.company_name is not None:
        client.company_name = client_data.company_name
    if client_data.requested_services is not None:
        client.requested_services = client_data.requested_services
    
    # Update user fields
    user = db.query(User).filter(User.id == client.user_id).first()
    if client_data.name is not None:
        user.name = client_data.name
    if client_data.address is not None:
        user.address = client_data.address
    if client_data.phone is not None:
        user.phone = client_data.phone
    
    db.commit()
    db.refresh(client)
    db.refresh(user)
    
    # Fetch sites for the response
    sites = db.query(Site).filter(Site.client_id == client_id).all()
    
    # Convert sites to dictionaries for proper JSON serialization
    sites_list = [
        {
            "id": site.id,
            "address": site.address,
            "client_id": site.client_id,
            "latitude": site.latitude,
            "longitude": site.longitude,
            "services_available": site.services_available
        }
        for site in sites
    ]
    
    return {
        "id": client.id,
        "user_id": client.user_id,
        "company_name": client.company_name,
        "requested_services": client.requested_services,
        "user": user,
        "sites": sites_list
    }

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a client (Admin only)"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Delete associated user
    user = db.query(User).filter(User.id == client.user_id).first()
    if user:
        db.delete(user)
    
    db.delete(client)
    db.commit()
    
    return None

# Site endpoints
@router.get("/{client_id}/sites", response_model=List[SiteResponse])
async def get_client_sites(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sites for a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    sites = db.query(Site).filter(Site.client_id == client_id).all()
    return sites

@router.post("/{client_id}/sites", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    client_id: int,
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new site for a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    site = Site(
        client_id=client_id,
        address=site_data.address,
        services_available=site_data.services_available
    )
    
    # TODO: Geocode address to get latitude/longitude
    # This will be implemented when we add the geocoding service
    
    db.add(site)
    db.commit()
    db.refresh(site)
    
    return site

@router.get("/sites/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    
    # Check permissions
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return site

@router.put("/sites/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: int,
    site_data: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    
    # Check permissions
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if site_data.address is not None:
        site.address = site_data.address
        # TODO: Re-geocode address
    
    if site_data.services_available is not None:
        site.services_available = site_data.services_available
    
    db.commit()
    db.refresh(site)
    
    return site

@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    
    # Check permissions
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(site)
    db.commit()
    
    return None

# Contact Person endpoints
@router.get("/sites/{site_id}/contacts", response_model=List[ContactPersonResponse])
async def get_site_contacts(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contact persons for a site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    
    # Check permissions
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    contacts = db.query(ContactPerson).filter(ContactPerson.site_id == site_id).all()
    return contacts

@router.post("/sites/{site_id}/contacts", response_model=ContactPersonResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_person(
    site_id: int,
    contact_data: ContactPersonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact person for a site"""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    
    # Check permissions
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    contact = ContactPerson(
        site_id=site_id,
        name=contact_data.name,
        email=contact_data.email,
        phone=contact_data.phone
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    
    return contact

@router.put("/contacts/{contact_id}", response_model=ContactPersonResponse)
async def update_contact_person(
    contact_id: int,
    contact_data: ContactPersonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a contact person"""
    contact = db.query(ContactPerson).filter(ContactPerson.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact person not found"
        )
    
    # Check permissions
    site = db.query(Site).filter(Site.id == contact.site_id).first()
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if contact_data.name is not None:
        contact.name = contact_data.name
    if contact_data.email is not None:
        contact.email = contact_data.email
    if contact_data.phone is not None:
        contact.phone = contact_data.phone
    
    db.commit()
    db.refresh(contact)
    
    return contact

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_person(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a contact person"""
    contact = db.query(ContactPerson).filter(ContactPerson.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact person not found"
        )
    
    # Check permissions
    site = db.query(Site).filter(Site.id == contact.site_id).first()
    client = db.query(Client).filter(Client.id == site.client_id).first()
    if current_user.role != UserRole.ADMIN and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(contact)
    db.commit()
    
    return None