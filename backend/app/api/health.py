"""
Health check endpoints.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import pytz

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    ist = pytz.timezone("Asia/Kolkata")
    return JSONResponse(
        content={
            "status": "healthy",
            "timestamp": datetime.now(ist).isoformat(),
            "timezone": "Asia/Kolkata",
        }
    )
