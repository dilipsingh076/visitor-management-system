"""Nearby Places API — find shops and facilities nearby using Ola Maps."""
from fastapi import APIRouter, Depends, HTTPException, Query
import structlog

from app.core.config import settings
from app.core.dependencies import get_current_resident_or_admin
from app.services.nearby_places import (
    search_nearby,
    SUPPORTED_CATEGORIES,
)

router = APIRouter()
logger = structlog.get_logger()


@router.get("/categories")
async def list_categories(
    current_user: dict = Depends(get_current_resident_or_admin),
):
    """Return supported place categories."""
    return SUPPORTED_CATEGORIES


@router.get("")
async def list_nearby_places(
    category: str | None = Query(None, description="Place category filter"),
    radius: int = Query(3000, ge=500, le=5000, description="Search radius in meters"),
    lat: float | None = Query(None, description="User latitude"),
    lng: float | None = Query(None, description="User longitude"),
    current_user: dict = Depends(get_current_resident_or_admin),
):
    """Search for nearby places. Uses user's location (lat/lng) from browser."""
    if not settings.OLA_MAPS_API_KEY:
        raise HTTPException(status_code=503, detail="Ola Maps API key not configured")

    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Location required. Please allow location access in your browser.")

    # Search nearby
    try:
        places = search_nearby(lat, lng, category=category, radius=radius)
    except Exception as e:
        logger.error("Nearby search failed", error=str(e))
        raise HTTPException(status_code=502, detail="Failed to fetch nearby places")

    return {"places": places, "center": {"lat": lat, "lng": lng}, "radius": radius}
