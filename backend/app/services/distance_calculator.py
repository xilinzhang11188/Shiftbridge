import googlemaps
from typing import Optional, Tuple
from math import radians, cos, sin, asin, sqrt
from app.config import settings

# Initialize Google Maps client
gmaps = None
if settings.GOOGLE_MAPS_API_KEY:
    try:
        gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
    except Exception as e:
        print(f"Warning: Could not initialize Google Maps client: {e}")

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in miles
    """
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radius of earth in miles
    r = 3956
    
    return c * r

def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address to get latitude and longitude
    Returns (latitude, longitude) or None if geocoding fails
    """
    if not gmaps:
        print("Warning: Google Maps client not initialized")
        return None
    
    try:
        geocode_result = gmaps.geocode(address)
        if geocode_result:
            location = geocode_result[0]['geometry']['location']
            return (location['lat'], location['lng'])
    except Exception as e:
        print(f"Geocoding error for address '{address}': {e}")
    
    return None

def calculate_driving_distance(origin: str, destination: str) -> Optional[float]:
    """
    Calculate driving distance between two addresses using Google Maps API
    Returns distance in miles or None if calculation fails
    """
    if not gmaps:
        print("Warning: Google Maps client not initialized, using fallback")
        # Fallback to straight-line distance if Google Maps not available
        origin_coords = geocode_address(origin)
        dest_coords = geocode_address(destination)
        
        if origin_coords and dest_coords:
            return haversine_distance(
                origin_coords[0], origin_coords[1],
                dest_coords[0], dest_coords[1]
            )
        return None
    
    try:
        # Get distance matrix
        result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="driving",
            units="imperial"
        )
        
        if result['rows'] and result['rows'][0]['elements']:
            element = result['rows'][0]['elements'][0]
            if element['status'] == 'OK':
                # Distance is in meters, convert to miles
                distance_meters = element['distance']['value']
                distance_miles = distance_meters * 0.000621371
                return distance_miles
    except Exception as e:
        print(f"Distance calculation error: {e}")
    
    return None

def calculate_distance_with_coords(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float
) -> float:
    """
    Calculate straight-line distance between two coordinate pairs
    Returns distance in miles
    """
    return haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)