"""Nearby places service using Ola Maps API."""
import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger()

OLA_BASE = "https://api.olamaps.io"

# In-memory geocode cache: society_id -> (lat, lng)
_geocode_cache: dict[str, tuple[float, float]] = {}

SUPPORTED_CATEGORIES = [
    {"id": "grocery_store", "label": "Grocery"},
    {"id": "pharmacy", "label": "Pharmacy"},
    {"id": "hospital", "label": "Hospital"},
    {"id": "atm", "label": "ATM"},
    {"id": "restaurant", "label": "Restaurant"},
    {"id": "gym", "label": "Gym"},
    {"id": "school", "label": "School"},
    {"id": "gas_station", "label": "Petrol Pump"},
    {"id": "bank", "label": "Bank"},
    {"id": "police", "label": "Police"},
    {"id": "post_office", "label": "Post Office"},
    {"id": "park", "label": "Park"},
    {"id": "shopping_mall", "label": "Shopping Mall"},
    {"id": "salon", "label": "Salon"},
    {"id": "laundry", "label": "Laundry"},
]


def geocode_address(address: str, city: str, pincode: str, society_id: str) -> tuple[float, float]:
    """Convert address to lat/lng using Ola Maps Geocode API. Caches result per society."""
    if society_id in _geocode_cache:
        return _geocode_cache[society_id]

    query_parts = [p for p in [address, city, pincode] if p]
    query = ", ".join(query_parts)
    if not query:
        raise ValueError("Society has no address, city, or pincode configured")

    resp = httpx.get(
        f"{OLA_BASE}/places/v1/geocode",
        params={
            "api_key": settings.OLA_MAPS_API_KEY,
            "address": query,
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()

    results = data.get("geocodingResults", [])
    if not results:
        raise ValueError(f"Could not geocode address: {query}")

    geometry = results[0].get("geometry", {})
    location = geometry.get("location", {})
    lat = location.get("lat")
    lng = location.get("lng")

    if lat is None or lng is None:
        raise ValueError(f"No coordinates in geocode response for: {query}")

    coords = (float(lat), float(lng))
    _geocode_cache[society_id] = coords
    logger.info("Geocoded society", society_id=society_id, lat=coords[0], lng=coords[1])
    return coords


def search_nearby(lat: float, lng: float, category: str | None = None, radius: int = 3000) -> list[dict]:
    """Search nearby places using Ola Maps Nearby Search API."""
    params: dict = {
        "api_key": settings.OLA_MAPS_API_KEY,
        "layers": "venue",
        "location": f"{lat},{lng}",
        "radius": radius,
        "limit": 20,
    }
    if category:
        params["types"] = category

    resp = httpx.get(
        f"{OLA_BASE}/places/v1/nearbysearch",
        params=params,
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()

    predictions = data.get("predictions", [])
    places = []
    for p in predictions:
        geometry = p.get("geometry", {})
        location = geometry.get("location", {})
        place = {
            "place_id": p.get("place_id", ""),
            "name": p.get("structured_formatting", {}).get("main_text", p.get("description", "Unknown")),
            "address": p.get("description", ""),
            "category": _extract_category(p.get("types", [])),
            "lat": location.get("lat"),
            "lng": location.get("lng"),
            "distance_m": p.get("distance_meters"),
        }
        places.append(place)

    # Sort by distance
    places.sort(key=lambda x: x.get("distance_m") or 999999)
    return places


def _extract_category(types: list[str]) -> str:
    """Extract a human-readable category from Ola Maps place types."""
    category_map = {c["id"]: c["label"] for c in SUPPORTED_CATEGORIES}
    for t in types:
        if t in category_map:
            return category_map[t]
    return types[0] if types else "Other"
