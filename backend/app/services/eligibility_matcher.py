from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.user import Worker, User
from app.models.shift import Shift
from app.models.site import Site
from app.services.distance_calculator import calculate_driving_distance, calculate_distance_with_coords

MAX_DISTANCE_MILES = 50

def check_service_match(shift_service_ids: List[int], worker_service_ids: List[int]) -> bool:
    """
    Check if worker offers all services required by the shift
    Returns True if worker can provide all shift services
    """
    shift_services = set(shift_service_ids)
    worker_services = set(worker_service_ids)
    
    # Worker must offer all services required by the shift
    return shift_services.issubset(worker_services)

def check_license_match(site_state: str, worker_licensed_states: List[str]) -> bool:
    """
    Check if worker is licensed in the state where the shift site is located
    Returns True if worker is licensed in the site's state
    """
    return site_state in worker_licensed_states

def extract_state_from_address(address: str) -> str:
    """
    Extract state code from address string
    This is a simple implementation - in production, use geocoding API
    """
    # Common US state abbreviations
    states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ]
    
    address_upper = address.upper()
    for state in states:
        if f' {state} ' in address_upper or address_upper.endswith(f' {state}'):
            return state
    
    return ""

def check_distance_eligibility(
    worker_address: str,
    site_address: str,
    worker_lat: float = None,
    worker_lon: float = None,
    site_lat: float = None,
    site_lon: float = None
) -> tuple[bool, float]:
    """
    Check if worker is within acceptable distance of the shift site
    Returns (is_eligible, distance_in_miles)
    """
    distance = None
    
    # Try to use coordinates if available
    if all([worker_lat, worker_lon, site_lat, site_lon]):
        from app.services.distance_calculator import calculate_distance_with_coords
        distance = calculate_distance_with_coords(worker_lat, worker_lon, site_lat, site_lon)
    else:
        # Fall back to address-based calculation
        distance = calculate_driving_distance(worker_address, site_address)
    
    if distance is None:
        # If we can't calculate distance, assume not eligible for safety
        return (False, 0)
    
    is_eligible = distance <= MAX_DISTANCE_MILES
    return (is_eligible, distance)

def get_eligible_workers_for_shift(db: Session, shift: Shift) -> List[Dict]:
    """
    Get all workers eligible for a specific shift
    Returns list of dicts with worker info and eligibility details
    """
    # Get shift site
    site = db.query(Site).filter(Site.id == shift.site_id).first()
    if not site:
        return []
    
    # Extract state from site address
    site_state = extract_state_from_address(site.address)
    
    # Get all workers
    workers = db.query(Worker).all()
    eligible_workers = []
    
    for worker in workers:
        # Get worker user info
        user = db.query(User).filter(User.id == worker.user_id).first()
        if not user:
            continue
        
        # Check service match
        service_match = check_service_match(shift.service_ids, worker.services_offered)
        if not service_match:
            continue
        
        # Check license match
        license_match = check_license_match(site_state, worker.licensed_states)
        if not license_match:
            continue
        
        # Check distance
        distance_eligible, distance = check_distance_eligibility(
            user.address,
            site.address,
            None,  # worker_lat - to be added when geocoding is implemented
            None,  # worker_lon
            site.latitude,
            site.longitude
        )
        
        if not distance_eligible:
            continue
        
        # Worker is eligible!
        eligible_workers.append({
            "worker_id": worker.id,
            "worker_name": user.name,
            "worker_email": user.email,
            "worker_phone": user.phone,
            "distance_miles": round(distance, 2),
            "license_type": worker.license_type,
            "services_offered": worker.services_offered
        })
    
    # Sort by distance (closest first)
    eligible_workers.sort(key=lambda x: x["distance_miles"])
    
    return eligible_workers

def is_worker_eligible_for_shift(db: Session, worker_id: int, shift_id: int) -> tuple[bool, str]:
    """
    Check if a specific worker is eligible for a specific shift
    Returns (is_eligible, reason)
    """
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        return (False, "Worker not found")
    
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        return (False, "Shift not found")
    
    site = db.query(Site).filter(Site.id == shift.site_id).first()
    if not site:
        return (False, "Site not found")
    
    user = db.query(User).filter(User.id == worker.user_id).first()
    if not user:
        return (False, "Worker user not found")
    
    # Check service match
    if not check_service_match(shift.service_ids, worker.services_offered):
        return (False, "Worker does not offer required services")
    
    # Check license match
    site_state = extract_state_from_address(site.address)
    if not check_license_match(site_state, worker.licensed_states):
        return (False, f"Worker not licensed in {site_state}")
    
    # Check distance
    distance_eligible, distance = check_distance_eligibility(
        user.address,
        site.address,
        None,
        None,
        site.latitude,
        site.longitude
    )
    
    if not distance_eligible:
        return (False, f"Worker is {round(distance, 2)} miles away (max: {MAX_DISTANCE_MILES} miles)")
    
    return (True, "Worker is eligible")